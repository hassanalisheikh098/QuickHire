import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useToast } from '../context/ToastContext'

export default function SelectRolePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // If not logged in, redirect to login page
    if (!user) {
      navigate('/auth')
      return
    }

    // Check if they already have a role
    const checkRole = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.role) {
        if (profile.role === 'candidate') {
          // Check if candidate profile is complete
          const { data: candidate } = await supabase
            .from('candidates')
            .select('id')
            .eq('id', user.id)
            .maybeSingle()

          if (!candidate) {
            navigate('/onboarding')
          } else {
            navigate(`/candidates/${user.id}`)
          }
        } else {
          navigate('/dashboard')
        }
      } else {
        setChecking(false)
      }
    }

    checkRole()
  }, [user, navigate])

  const selectRole = async (role) => {
    setLoading(role)
    try {
      // Guard: re-fetch current role from DB to prevent overwrites
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      if (existingProfile?.role) {
        showToast('Role already assigned')
        if (existingProfile.role === 'candidate') {
          const { data: candidate } = await supabase
            .from('candidates')
            .select('id')
            .eq('id', user.id)
            .maybeSingle()
          navigate(candidate ? `/candidates/${user.id}` : '/onboarding')
        } else {
          navigate('/dashboard')
        }
        return
      }

      // 1. Update database profile
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', user.id)

      if (error) throw error

      // 2. Sync to Supabase auth metadata to instantly trigger context update
      const { error: authError } = await supabase.auth.updateUser({
        data: { role }
      })

      if (authError) throw authError

      showToast(`Selected role: ${role} ✓`)

      // Redirect accordingly
      if (role === 'candidate') {
        navigate('/onboarding')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      console.error('Error saving role:', err)
      showToast(err.message || 'Error saving role selection')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Verifying role selection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 mesh-gradient opacity-30" />
      <div className="absolute top-1/4 left-1/4 size-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 size-72 bg-blue-600/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-2xl bg-card-dark/85 backdrop-blur-md border border-border-dark p-8 md:p-12 rounded-[2rem] shadow-2xl text-center space-y-8 animate-stepEnter">
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-1 mb-2">
            <span className="text-2xl font-black tracking-tight text-white">Quick</span>
            <span className="text-2xl font-black tracking-tight text-primary">Hire</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Choose Your Account Type</h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            To continue, please select if you are looking to hire top talent or looking to get hired.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Recruiter Card */}
          <button
            onClick={() => selectRole('recruiter')}
            disabled={!!loading}
            className="group relative flex flex-col items-center text-center p-8 bg-background-dark border border-border-dark hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 rounded-2xl transition-all duration-300 disabled:opacity-60"
          >
            <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-4xl">work</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">I'm a Recruiter</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Find, screen, and manage candidates with conversational AI search and automated scoring metrics.
            </p>
            {loading === 'recruiter' && (
              <span className="absolute bottom-4 flex items-center gap-2 text-primary text-xs font-semibold">
                <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Setting up recruiter account...
              </span>
            )}
          </button>

          {/* Candidate Card */}
          <button
            onClick={() => selectRole('candidate')}
            disabled={!!loading}
            className="group relative flex flex-col items-center text-center p-8 bg-background-dark border border-border-dark hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/5 rounded-2xl transition-all duration-300 disabled:opacity-60"
          >
            <div className="size-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-blue-400 text-4xl">person_search</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">I'm a Candidate</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Upload your resume to instantly generate your dynamic profile, get matched, and discover opportunities.
            </p>
            {loading === 'candidate' && (
              <span className="absolute bottom-4 flex items-center gap-2 text-blue-400 text-xs font-semibold">
                <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                Setting up candidate account...
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
