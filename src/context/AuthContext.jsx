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

            const oauthRole = localStorage.getItem('oauth_role')
            if (oauthRole) {
              localStorage.removeItem('oauth_role')
              const fullName =
                currentUser.user_metadata?.full_name ||
                currentUser.user_metadata?.name ||
                'User'

              // Upsert to profiles to ensure it exists and has the correct role
              const { error: upsertError } = await supabase
                .from('profiles')
                .upsert({
                  id: currentUser.id,
                  email: currentUser.email,
                  full_name: fullName,
                  role: oauthRole,
                })

              if (upsertError) {
                console.error('Error updating/inserting profile with oauthRole:', upsertError)
              }

              // Sync to Supabase auth metadata to instantly trigger context update
              await supabase.auth.updateUser({
                data: { role: oauthRole }
              })

              currentUser.user_metadata = {
                ...currentUser.user_metadata,
                full_name: fullName,
                role: oauthRole,
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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata.full_name,
          role: metadata.role || 'recruiter',
        }
      }
    })

    if (!error && data?.user) {
      // Create a profile record immediately to bypass triggers wait
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: email,
          full_name: metadata.full_name,
          role: metadata.role || 'recruiter',
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
        redirectTo: `${window.location.origin}/auth`
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
