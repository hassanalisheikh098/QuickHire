import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login')
  const [role, setRole] = useState('recruiter')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user, navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!email.trim()) {
      setError("Please enter your email")
      return
    }

    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      if (mode === 'login') {
        signIn(email, password)
        navigate('/dashboard')
      } else {
        signUp(email, password, { full_name: fullName, role })
        if (role === 'candidate') {
          navigate('/onboarding')
        } else {
          navigate('/dashboard')
        }
      }
    }, 600)
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
            Join 500+ companies that trust QuickHire's AI to discover, evaluate and connect with top talent.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { value: '2.4K+', label: 'Candidates' },
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
