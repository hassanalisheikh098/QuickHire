/**
 * AuthCallbackPage — handles the redirect from Supabase/Google OAuth.
 *
 * Why this page exists:
 *   Previously, Google OAuth redirected back to /auth. That page has its own
 *   useEffect that immediately reads the user's role and navigates away — but
 *   AuthContext's onAuthStateChange (which reads oauth_role from localStorage
 *   and upserts the profile) runs concurrently and may not have finished yet.
 *   The result was a race: the profile had no role when /auth checked, so the
 *   user was sent to /select-role regardless of which role they chose.
 *
 *   This page fixes the race by doing nothing except showing a spinner until
 *   AuthContext has fully resolved (loading === false && user is set with a role).
 *   Only then does it redirect to the correct destination.
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function AuthCallbackPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Wait until AuthContext finishes its async onAuthStateChange processing.
    // While loading===true, AuthContext is still fetching the profile and
    // potentially upserting the role from localStorage's oauth_role key.
    if (loading) return

    if (!user) {
      // No session — something went wrong with OAuth; send back to login.
      navigate('/auth', { replace: true })
      return
    }

    // AuthContext has finished. Now read the resolved role.
    // We re-fetch from the DB to guarantee we have the latest value
    // (user_metadata may lag by one render if updateUser hasn't propagated).
    const redirect = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      const role = profile?.role || user.user_metadata?.role || null

      if (!role) {
        navigate('/select-role', { replace: true })
        return
      }

      if (role === 'candidate') {
        const { data: candidate } = await supabase
          .from('candidates')
          .select('id')
          .eq('id', user.id)
          .maybeSingle()
        navigate(candidate ? `/candidates/${user.id}` : '/onboarding', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    }

    redirect()
  }, [user, loading, navigate])

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center">
      <div className="text-center space-y-4">
        <div
          className="w-12 h-12 rounded-full animate-spin mx-auto"
          style={{ border: '4px solid #6366f1', borderTopColor: 'transparent' }}
        />
        <p className="text-slate-400 text-sm">Completing sign-in...</p>
      </div>
    </div>
  )
}
