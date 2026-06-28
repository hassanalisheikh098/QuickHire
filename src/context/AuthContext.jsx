import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // IMPORTANT: onAuthStateChange callbacks must NOT be async themselves —
    // Supabase ignores the returned Promise, so any uncaught rejection inside
    // an async callback silently prevents setLoading(false) from running and
    // leaves the app stuck on the loader. We use an inner IIFE with try/finally
    // to guarantee setLoading(false) always fires.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Run all async logic in a non-awaited inner function so the outer
      // callback stays synchronous (Supabase requirement).
      ;(async () => {
        try {
          const currentUser = session?.user ?? null

          if (currentUser) {
            // Always fetch and attach the profile, regardless of event type
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .maybeSingle()

            // Fix #4: Enum guard — only honor oauth_role if it is exactly one of the two
            // valid role strings. Any other value (including 'candidate' from an old default,
            // an empty string, or a tampered value) is discarded so the user falls through
            // to /select-role instead of receiving a silently wrong role assignment.
            const VALID_ROLES = ['recruiter', 'candidate']
            const rawOauthRole = localStorage.getItem('oauth_role')
            const oauthRole = VALID_ROLES.includes(rawOauthRole) ? rawOauthRole : null
            // Always clear the key regardless of whether the value was valid
            if (rawOauthRole) localStorage.removeItem('oauth_role')

            if (oauthRole) {
              const fullName =
                currentUser.user_metadata?.full_name ||
                currentUser.user_metadata?.name ||
                'User'

              // Guard: If profile already exists and has an assigned role, preserve it.
              // This prevents a repeat OAuth sign-in from overwriting an existing role.
              const finalRole = profile?.role || oauthRole

              // Upsert to profiles to ensure it exists and has the correct role
              const { error: upsertError } = await supabase
                .from('profiles')
                .upsert({
                  id: currentUser.id,
                  email: currentUser.email,
                  full_name: fullName,
                  role: finalRole,
                })

              if (upsertError) {
                console.error('Error updating/inserting profile with oauthRole:', upsertError)
              }

              // Sync to Supabase auth metadata to instantly trigger context update
              await supabase.auth.updateUser({
                data: { role: finalRole }
              })

              currentUser.user_metadata = {
                ...currentUser.user_metadata,
                full_name: fullName,
                role: finalRole,
              }
            } else if (profile) {
              // Merge DB profile data into user metadata.
              // KEY FIX: don't overwrite a valid existing role with null —
              // the profile row may exist (from signUp upsert) before the user
              // has picked a role on SelectRolePage, leaving profile.role = null.
              currentUser.user_metadata = {
                ...currentUser.user_metadata,
                full_name: profile.full_name || currentUser.user_metadata?.full_name,
                role: profile.role || currentUser.user_metadata?.role,
              }
            } else if (event === 'SIGNED_IN') {
              // New OAuth/Email user — create their profile
              const fullName =
                currentUser.user_metadata?.full_name ||
                currentUser.user_metadata?.name ||
                'User'

              const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: currentUser.id,
                  email: currentUser.email,
                  full_name: fullName,
                  role: null,
                })

              if (insertError) {
                console.error('Error creating profile on SIGNED_IN:', insertError)
              }

              currentUser.user_metadata = {
                ...currentUser.user_metadata,
                full_name: fullName,
                role: null,
              }
            }

            setUser({ ...currentUser })
          } else {
            setUser(null)
          }
        } catch (err) {
          console.error('AuthContext: error in onAuthStateChange handler:', err)
          setUser(null)
        } finally {
          // Always clear the loading gate — this is the line that was
          // silently skipped whenever an async error occurred above.
          setLoading(false)
        }
      })()
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, metadata = {}) => {
    // Optional check: if email already exists in public profiles and has a role, reject early
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', email)
        .maybeSingle()

      if (existingProfile?.role) {
        return { data: null, error: { message: "An account with this email already exists." } }
      }
    } catch (e) {
      console.warn("Pre-signup profile check failed (likely due to RLS policies):", e)
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata.full_name,
          role: metadata.role || null,
        }
      }
    })

    if (!error && data?.user) {
      // Fetch profile to see if it exists (in case of race conditions or existing profile with no role)
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()

      const roleToSave = currentProfile?.role || metadata.role || null

      // Create a profile record immediately to bypass triggers wait
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: email,
          full_name: metadata.full_name,
          role: roleToSave,
        })
      if (profileError) console.error('Error creating profile in signUp:', profileError)
    }

    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redirect to /auth/callback — a dedicated page that waits for
        // AuthContext to finish processing oauth_role before navigating.
        // Previously this pointed to /auth, which caused a race condition:
        // AuthPage's redirect useEffect would read the profile before
        // AuthContext's onAuthStateChange upsert had finished, find no role,
        // and send every OAuth user to /select-role.
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    setUser(null)
    navigate('/')
    return { error }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
