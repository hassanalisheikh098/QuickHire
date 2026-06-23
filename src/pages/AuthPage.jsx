import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login')
  const [role, setRole] = useState('candidate')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const { signIn, signUp, signInWithGoogle, user } = useAuth()
  const navigate = useNavigate()
  const [candidateCount, setCandidateCount] = useState(null)

  useEffect(() => {
    const fetchCandidateCount = async () => {
      const { count, error } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })
      if (!error && count !== null) {
        setCandidateCount(count)
      }
    }
    fetchCandidateCount()
  }, [])

  useEffect(() => {
    if (user) {
      const checkRoleAndRedirect = async () => {
        // Fetch user profile from Supabase to check role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
        
        const userRole = profile?.role || user.user_metadata?.role || null

        // FIX: If we just signed up (success message is showing), delay
        // the redirect by 1.5s so the user can actually read the message.
        const delay = message ? 1500 : 0

        setTimeout(() => {
          if (!userRole) {
            navigate('/select-role')
            return
          }
          if (userRole === 'candidate') {
            // Check if candidate profile is complete
            supabase
              .from('candidates')
              .select('id')
              .eq('id', user.id)
              .maybeSingle()
              .then(({ data: candidate }) => {
                if (!candidate) {
                  navigate('/onboarding')
                } else {
                  navigate(`/candidates/${user.id}`)
                }
              })
          } else {
            navigate('/dashboard')
          }
        }, delay)
      }
      checkRoleAndRedirect()
    }
  }, [user, navigate, message])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!email.trim()) {
      setError("Please enter your email")
      return
    }

    // Client-side validation for signup — catches issues before the API call
    if (mode === 'signup') {
      if (!fullName.trim()) {
        setError("Please enter your full name")
        return
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters")
        return
      }
    }

    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password)
        if (error) throw error
        // Navigation is handled by the useEffect that watches user state.
        // We must call setLoading(false) here or the button spins forever
        // while the async checkRoleAndRedirect() resolves.
        setLoading(false)
      } else {
        const { error } = await signUp(email, password, { full_name: fullName, role })
        if (error) throw error
        setMessage("Account created! You can now sign in.")
        setLoading(false)
      }
    } catch (err) {
      setError(err.message || "An authentication error occurred.")
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    try {
      if (mode === 'signup') {
        localStorage.setItem('oauth_role', role)
      } else {
        localStorage.removeItem('oauth_role')
      }
      const { error } = await signInWithGoogle()
      if (error) throw error
    } catch (err) {
      setError(err.message || "An error occurred during Google sign-in.")
    }
  }

  return (
    <div className="min-h-screen bg-background-dark flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-card-dark border-r border-border-dark p-12 relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-50" />
        <div className="absolute top-1/4 left-1/4 size-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 size-48 bg-blue-600/10 rounded-full blur-3xl" />

        <Link to="/" className="relative flex items-center gap-1">
          <span className="text-xl font-black tracking-tight text-white">Quick</span>
          <span className="text-xl font-black tracking-tight text-primary">Hire</span>
        </Link>

        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            AI-Powered Hiring
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight">
            Find the right talent,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
              10x faster.
            </span>
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Join 7 companies that trust QuickHire's AI to discover, evaluate and connect with top talent.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { value: candidateCount !== null ? `${candidateCount}` : '...', label: 'Candidates' },
              { value: '98%', label: 'AI Accuracy' },
              { value: '70%', label: 'Time Saved' },
            ].map((stat) => (
              <div key={stat.label} className="bg-background-dark/50 rounded-xl p-4 border border-border-dark">
                <div className="text-2xl font-bold text-primary mono-font">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-slate-600 text-sm">© 2025 QuickHire AI. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link to="/" className="lg:hidden flex items-center gap-1 mb-8">
              <span className="text-xl font-black tracking-tight text-white">Quick</span>
              <span className="text-xl font-black tracking-tight text-primary">Hire</span>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-slate-400">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null) }}
                className="text-primary font-semibold hover:underline"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Role toggle — only on signup */}
          {mode === 'signup' && (
            <div className="flex gap-2 p-1 bg-card-dark rounded-xl border border-border-dark mb-6">
              {['recruiter', 'candidate'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold capitalize transition-all ${
                    role === r ? 'bg-primary text-background-dark' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  I'm a {r}
                </button>
              ))}
            </div>
          )}



          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Alex Rivera"
                  className="w-full bg-card-dark border border-border-dark rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full bg-card-dark border border-border-dark rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Min. 6 characters"
                className="w-full bg-card-dark border border-border-dark rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}

            {message && (
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 text-primary text-sm">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-background-dark py-3.5 rounded-xl font-bold text-base hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                  Processing...
                </>
              ) : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-dark"></div>
            </div>
            <span className="relative px-3 bg-background-dark text-slate-500 text-xs uppercase font-medium">Or continue with</span>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-card-dark border border-border-dark hover:border-slate-600 py-3 rounded-xl font-bold text-slate-200 transition-all text-sm hover:scale-[1.02] disabled:opacity-60"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-600">
              By continuing, you agree to our{' '}
              <a href="#" className="text-slate-400 hover:text-primary">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-slate-400 hover:text-primary">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
