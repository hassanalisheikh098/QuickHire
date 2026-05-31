import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import CandidateCard from '../components/CandidateCard'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const MOCK_CANDIDATES = [
  { id: 1, name: 'Alex Rivera', title: 'Senior Frontend Engineer', ai_score: 98, skills: ['React', 'TypeScript', 'GraphQL', 'Next.js', 'Vite'], location: 'San Francisco, CA', bio: 'I build beautiful, performant interfaces that users love. 8+ years shipping production React applications for companies ranging from early-stage startups to Fortune 500s.', experiences: [{ company: 'Stripe', role: 'Senior Engineer', from: '2022-01', current: true, description: 'Led frontend architecture for Stripe Dashboard, improving performance by 40%.' }, { company: 'Airbnb', role: 'Software Engineer', from: '2019-06', to: '2021-12', description: 'Built core booking flow components serving 150M+ users.' }], email: 'alex@example.com', github: 'github.com/alexrivera', gradient: 'from-primary to-emerald-600' },
  { id: 2, name: 'Sarah Jenkins', title: 'Machine Learning Engineer', ai_score: 96, skills: ['Python', 'PyTorch', 'MLOps', 'TensorFlow', 'Kubernetes', 'GCP'], location: 'New York, NY', bio: 'Passionate about turning data into impact. I build and deploy ML systems at scale.', experiences: [{ company: 'OpenAI', role: 'ML Engineer', from: '2023-03', current: true, description: 'Working on model evaluation infrastructure and safety tooling.' }, { company: 'Google Brain', role: 'Research Engineer', from: '2020-08', to: '2023-02', description: 'Published 3 papers on efficient transformers.' }], email: 'sarah@example.com', github: 'github.com/sarahjenkins', gradient: 'from-blue-500 to-indigo-600' },
  { id: 3, name: 'Michael Zhang', title: 'Backend Architect', ai_score: 94, skills: ['Go', 'Kubernetes', 'gRPC', 'Rust', 'PostgreSQL', 'Redis'], location: 'Austin, TX', bio: 'Systems thinker who loves designing distributed backends that are both highly available and a joy to maintain.', experiences: [{ company: 'Uber', role: 'Staff Engineer', from: '2021-04', current: true, description: 'Owns the real-time dispatch infrastructure handling 25M daily trips.' }], email: 'michael@example.com', github: 'github.com/michaelzhang', gradient: 'from-purple-500 to-pink-600' },
]

const MOCK_HISTORY = [
  { id: 1, query: 'Senior React engineer with GraphQL', results: 12, created_at: '2025-05-29' },
  { id: 2, query: 'ML engineers fintech experience', results: 7, created_at: '2025-05-28' },
  { id: 3, query: 'Python backend distributed systems', results: 18, created_at: '2025-05-27' },
  { id: 4, query: 'iOS Swift developer 3+ years', results: 5, created_at: '2025-05-26' },
]

export default function RecruiterDashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [saved, setSaved] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fake loading for 300ms
    const timer = setTimeout(() => {
      setSaved(MOCK_CANDIDATES)
      setHistory(MOCK_HISTORY)
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const handleUnsave = (candidate) => {
    setSaved((prev) => prev.filter((c) => c.id !== candidate.id))
    showToast("Removed from shortlist")
  }

  const STATS = [
    { label: 'Saved Candidates', icon: 'bookmark', color: 'text-primary', bg: 'bg-primary/10', value: saved.length },
    { label: 'AI Searches', icon: 'manage_search', color: 'text-blue-400', bg: 'bg-blue-400/10', value: history.length },
    { label: 'Active Roles', icon: 'work', color: 'text-purple-400', bg: 'bg-purple-400/10', value: 3 },
    { label: 'Match Rate', icon: 'verified', color: 'text-amber-400', bg: 'bg-amber-400/10', value: '94%' },
  ]

  return (
    <div className="bg-background-dark min-h-screen text-slate-100 flex">
      <Sidebar active="saved" />
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="border-b border-border-dark px-8 py-5 flex items-center justify-between bg-background-dark/80 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h1 className="text-xl font-bold text-white">
              {user ? `Welcome back, ${user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Recruiter'} 👋` : 'Recruiter Dashboard'}
            </h1>
            <p className="text-slate-500 text-sm">Here's what's happening with your talent pipeline today.</p>
          </div>
          <Link to="/search" className="flex items-center gap-2 px-5 py-2.5 bg-primary text-background-dark rounded-xl font-bold text-sm hover:scale-105 transition-all">
            <span className="material-symbols-outlined text-lg">manage_search</span>
            New AI Search
          </Link>
        </header>

        <main className="px-8 py-8 space-y-10 max-w-7xl step-enter">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-card-dark border border-border-dark rounded-2xl p-5 hover:-translate-y-1 transition-transform">
                <div className={`${s.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                  <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
                </div>
                <div className="text-2xl font-bold text-white mono-font mb-1">
                  {loading ? <span className="inline-block w-8 h-6 bg-border-dark rounded animate-pulse" /> : s.value}
                </div>
                <div className="text-slate-500 text-sm">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Saved Candidates */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Saved Candidates</h2>
                <p className="text-slate-500 text-sm mt-0.5">Your shortlisted talent</p>
              </div>
              <Link to="/candidates" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                Browse more <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <div key={i} className="bg-card-dark border border-border-dark rounded-xl h-64 animate-pulse" />)}
              </div>
            ) : saved.length === 0 ? (
              <div className="bg-card-dark border border-border-dark border-dashed rounded-2xl p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-600 block mb-4">bookmark</span>
                <h3 className="text-white font-semibold mb-2">No saved candidates yet</h3>
                <p className="text-slate-500 text-sm mb-6">Start browsing and save candidates you're interested in.</p>
                <Link to="/candidates" className="px-6 py-2.5 bg-primary text-background-dark rounded-xl font-bold text-sm hover:scale-105 transition-all inline-flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">group</span>Browse Talent
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {saved.map((candidate) => (
                  <CandidateCard key={candidate.id} candidate={candidate} onSave={handleUnsave} saved={true} />
                ))}
              </div>
            )}
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
            {/* Search History */}
            <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">Recent Searches</h2>
                <Link to="/search" className="text-xs text-primary hover:underline">View all</Link>
              </div>
              {history.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6">No searches yet.</p>
              ) : (
                <div className="space-y-3">
                  {history.map((h) => (
                    <Link key={h.id} to="/search" className="flex items-center gap-3 p-3 rounded-xl hover:bg-border-dark transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary text-sm">manage_search</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-300 truncate group-hover:text-white transition-colors">{h.query}</p>
                        <p className="text-xs text-slate-600">{h.results} results · {h.created_at}</p>
                      </div>
                      <span className="material-symbols-outlined text-slate-600 text-sm group-hover:text-primary transition-colors">arrow_forward</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-5">Quick Actions</h2>
              <div className="space-y-3">
                {[
                  { to: '/search', icon: 'manage_search', label: 'Start AI Search', desc: 'Find candidates with natural language', color: 'text-primary', bg: 'bg-primary/10' },
                  { to: '/candidates', icon: 'group', label: 'Browse All Talent', desc: 'Explore 2,400+ candidates', color: 'text-blue-400', bg: 'bg-blue-400/10' },
                  { to: '/onboarding', icon: 'person_add', label: 'Invite a Candidate', desc: 'Send onboarding link to a prospect', color: 'text-purple-400', bg: 'bg-purple-400/10' },
                ].map((a) => (
                  <Link key={a.label} to={a.to} className="flex items-center gap-4 p-4 rounded-xl border border-border-dark hover:border-primary/30 hover:bg-white/5 transition-all group">
                    <div className={`${a.bg} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <span className={`material-symbols-outlined ${a.color}`}>{a.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{a.label}</p>
                      <p className="text-xs text-slate-500">{a.desc}</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors">chevron_right</span>
                  </Link>
                ))}
              </div>
              <div className="mt-6 p-4 bg-background-dark rounded-xl border border-border-dark">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-white">Enterprise Pro</span>
                  <span className="text-xs text-slate-500">750 / 1000 searches</span>
                </div>
                <div className="w-full bg-border-dark h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '75%' }} />
                </div>
                <p className="text-[10px] text-slate-600 mt-1">250 searches remaining this month</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
