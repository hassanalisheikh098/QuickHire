import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import CandidateCard from '../components/CandidateCard'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { supabase } from '../lib/supabase'

export default function RecruiterDashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [saved, setSaved] = useState([])
  const [history, setHistory] = useState([])
  const [candidateProfile, setCandidateProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [totalCandidates, setTotalCandidates] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      setLoading(true)

      // Fix #4 (RecruiterDashboard): Removed the `|| 'recruiter'` fallback.
      // If role is null here, it means ProtectedRoute should have intercepted and
      // sent the user to /select-role. Using a fallback would silently treat a
      // role-less user as a recruiter, bypassing the selection gate.
      const userRole = user.user_metadata?.role
      if (userRole === 'candidate') {
        const { data: profile } = await supabase
          .from('candidates')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()
        
        setCandidateProfile(profile)
        setLoading(false)
        return
      }

      // Fetch saved candidates joined with candidates profiles
      const { data: savedData, error: savedError } = await supabase
        .from('saved_candidates')
        .select(`
          candidate_id,
          candidates (*)
        `)
        .eq('recruiter_id', user.id)
      
      if (savedData) {
        setSaved(savedData.map(item => item.candidates).filter(Boolean))
      } else {
        console.error('Error fetching shortlists:', savedError)
      }

      // Fetch search history log
      const { data: histData, error: histError } = await supabase
        .from('search_history')
        .select('*')
        .eq('recruiter_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6)
      
      if (histData) {
        setHistory(histData.map(item => ({
          id: item.id,
          query: item.query,
          results: item.results_count,
          created_at: new Date(item.created_at).toISOString().slice(0, 10)
        })))
      } else {
        console.error('Error fetching search history:', histError)
      }

      // Fetch total candidate count
      const { count: candCount } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })
      if (candCount !== null) {
        setTotalCandidates(candCount)
      }

      setLoading(false)
    }

    fetchData()
  }, [user])

  const handleUnsave = async (candidate) => {
    if (!user) return
    const { error } = await supabase
      .from('saved_candidates')
      .delete()
      .eq('recruiter_id', user.id)
      .eq('candidate_id', candidate.id)
    
    if (!error) {
      setSaved((prev) => prev.filter((c) => c.id !== candidate.id))
      showToast("Removed from shortlist")
    } else {
      showToast("Error removing from shortlist")
    }
  }

  const STATS = [
    { label: 'Saved Candidates', icon: 'bookmark', color: 'text-primary', bg: 'bg-primary/10', value: saved.length },
    { label: 'AI Searches', icon: 'manage_search', color: 'text-blue-400', bg: 'bg-blue-400/10', value: history.length },
    { label: 'Active Roles', icon: 'work', color: 'text-purple-400', bg: 'bg-purple-400/10', value: 3 },
    { label: 'Match Rate', icon: 'verified', color: 'text-amber-400', bg: 'bg-amber-400/10', value: '94%' },
  ]

  const userRole = user?.user_metadata?.role
  const isCandidate = userRole === 'candidate'

  if (isCandidate) {
    return (
      <div className="bg-background-dark min-h-screen text-slate-100 flex">
        <Sidebar active="saved" isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <header className="border-b border-border-dark px-6 md:px-8 py-5 flex items-center justify-between bg-background-dark/80 backdrop-blur-md sticky top-0 z-40 gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-slate-400 hover:text-white flex-shrink-0"
              >
                <span className="material-symbols-outlined text-2xl">menu</span>
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {user ? `Welcome back, ${user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Candidate'} 👋` : 'Candidate Dashboard'}
                </h1>
                <p className="text-slate-500 text-sm hidden sm:block">Manage your profile, resume, and discover opportunities.</p>
              </div>
            </div>
            {candidateProfile && (
              <Link to={`/candidates/${user.id}`} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-background-dark rounded-xl font-bold text-sm hover:scale-105 transition-all flex-shrink-0">
                <span className="material-symbols-outlined text-lg">person</span>
                <span className="hidden sm:inline">View Public Profile</span>
                <span className="sm:hidden">Profile</span>
              </Link>
            )}
          </header>

          <main className="px-8 py-8 space-y-10 max-w-4xl step-enter">
            {loading ? (
              <div className="space-y-6">
                <div className="bg-card-dark border border-border-dark rounded-2xl h-48 animate-pulse" />
                <div className="grid grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => <div key={i} className="bg-card-dark border border-border-dark rounded-2xl h-24 animate-pulse" />)}
                </div>
              </div>
            ) : !candidateProfile ? (
              <div className="bg-card-dark border border-border-dark border-dashed rounded-[2rem] p-12 text-center space-y-6">
                <div className="size-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(63,207,142,0.15)] border border-primary/20">
                  <span className="material-symbols-outlined text-primary text-5xl">upload_file</span>
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="text-2xl font-bold text-white">Complete Your Candidate Profile</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Upload your resume to instantly extract your skills, history, and calculate your AI ranking. Without a profile, recruiters won't be able to search or find you!
                  </p>
                </div>
                <Link to="/onboarding" className="px-8 py-4 bg-primary text-background-dark rounded-xl font-bold text-base hover:scale-105 transition-all inline-flex items-center gap-2 shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined">auto_awesome</span>
                  Upload Resume & Setup Profile
                </Link>
              </div>
            ) : (
              /* If profile IS complete */
              <div className="space-y-8 animate-stepEnter">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Profile Rating', value: `${candidateProfile.ai_score} AI`, icon: 'verified', color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Search Appearances', value: '24', icon: 'manage_search', color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'Recruiter Views', value: '12', icon: 'visibility', color: 'text-purple-400', bg: 'bg-purple-400/10' },
                  ].map((s) => (
                    <div key={s.label} className="bg-card-dark border border-border-dark rounded-2xl p-6">
                      <div className={`${s.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
                        <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
                      </div>
                      <div className="text-3xl font-bold text-white mono-font mb-1">{s.value}</div>
                      <div className="text-slate-500 text-sm">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Profile Overview Card */}
                <div className="bg-card-dark border border-border-dark rounded-2xl p-8 relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 w-48 h-full bg-gradient-to-tr ${candidateProfile.gradient || 'from-primary to-emerald-600'} opacity-[0.03] blur-2xl pointer-events-none`} />
                  
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="flex gap-5 items-start">
                      <div className="w-16 h-16 rounded-full border-2 border-border-dark flex-shrink-0">
                        <div className={`w-full h-full rounded-full bg-gradient-to-tr ${candidateProfile.gradient || 'from-primary to-emerald-600'} flex items-center justify-center text-2xl font-bold text-background-dark`}>
                          {candidateProfile.name?.charAt(0) || '?'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-white">{candidateProfile.name}</h2>
                        <p className="text-slate-400 text-sm">{candidateProfile.title}</p>
                        <p className="text-slate-500 text-xs flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          {candidateProfile.location || 'Remote'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                      <Link to={`/candidates/${user.id}`} className="flex-1 md:flex-none text-center px-5 py-2.5 bg-transparent border border-border-dark text-slate-200 hover:bg-border-dark rounded-xl text-sm font-semibold transition-colors">
                        View Profile
                      </Link>
                      <Link to="/onboarding" className="flex-1 md:flex-none text-center px-5 py-2.5 bg-primary text-background-dark rounded-xl text-sm font-bold hover:scale-[1.02] transition-all flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-sm">upload_file</span>
                        Update Resume
                      </Link>
                    </div>
                  </div>

                  <div className="border-t border-border-dark mt-6 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Skills Captured</h4>
                      <div className="flex flex-wrap gap-2 animate-pulse flex-1">
                        {candidateProfile.skills?.slice(0, 8).map((skill) => (
                          <span key={skill} className="px-2.5 py-1 bg-border-dark text-slate-300 text-xs font-medium rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Bio Summary</h4>
                      <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                        {candidateProfile.bio || 'No bio summary generated yet.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background-dark min-h-screen text-slate-100 flex">
      <Sidebar active="saved" isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="border-b border-border-dark px-6 md:px-8 py-5 flex items-center justify-between bg-background-dark/80 backdrop-blur-md sticky top-0 z-40 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white flex-shrink-0"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">
                {user ? `Welcome back, ${user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Recruiter'} 👋` : 'Recruiter Dashboard'}
              </h1>
              <p className="text-slate-500 text-sm hidden sm:block">Here's what's happening with your talent pipeline today.</p>
            </div>
          </div>
          <Link to="/search" className="flex items-center gap-2 px-5 py-2.5 bg-primary text-background-dark rounded-xl font-bold text-sm hover:scale-105 transition-all flex-shrink-0">
            <span className="material-symbols-outlined text-lg">manage_search</span>
            <span className="hidden sm:inline">New AI Search</span>
            <span className="sm:hidden">Search</span>
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
                  { to: '/candidates', icon: 'group', label: 'Browse All Talent', desc: totalCandidates ? `Explore ${totalCandidates} active candidates` : 'Explore all active candidates', color: 'text-blue-400', bg: 'bg-blue-400/10' },
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
