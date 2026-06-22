import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

function ScoreRing({ score }) {
  const r = 40, circ = 2 * Math.PI * r
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#2a2a2a" strokeWidth="6" />
        <circle cx="48" cy="48" r={r} fill="none" stroke="#3fcf8e" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={mounted ? (circ - (score / 100) * circ) : circ} className="score-ring" />
      </svg>
      <div className="text-center">
        <div className="text-2xl font-bold text-primary mono-font leading-none">{score}</div>
        <div className="text-[9px] text-slate-500 uppercase tracking-widest">AI Score</div>
      </div>
    </div>
  )
}

export default function CandidateProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useAuth()
  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [barsMounted, setBarsMounted] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      setBarsMounted(false)
      
      // Fetch candidate from Supabase
      const { data: profile, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      
      if (profile) {
        setCandidate(profile)
        
        // Fetch shortlist status if recruiter logged in
        if (user) {
          const { data: savedData } = await supabase
            .from('saved_candidates')
            .select('id')
            .eq('recruiter_id', user.id)
            .eq('candidate_id', id)
            .maybeSingle()
          
          setSaved(!!savedData)
        }
      } else {
        console.error('Error fetching profile:', error)
      }
      setLoading(false)
      
      const timer = setTimeout(() => setBarsMounted(true), 150)
      return () => clearTimeout(timer)
    }

    fetchProfile()
  }, [id, user])

  const handleSave = async () => {
    if (!user) {
      showToast("Please log in to save candidates")
      return
    }
    if (saved) {
      const { error } = await supabase
        .from('saved_candidates')
        .delete()
        .eq('recruiter_id', user.id)
        .eq('candidate_id', candidate.id)
      
      if (!error) {
        setSaved(false)
        showToast("Removed from shortlist")
      } else {
        showToast("Error removing from shortlist")
      }
    } else {
      const { error } = await supabase
        .from('saved_candidates')
        .insert({
          recruiter_id: user.id,
          candidate_id: candidate.id
        })
      
      if (!error) {
        setSaved(true)
        showToast("Saved to shortlist ✓")
      } else {
        showToast("Error saving to shortlist")
      }
    }
  }

  const isOwnProfile = user && user.id === id

  if (loading || !candidate) return (
    <div className="bg-background-dark min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-20 space-y-6">
        {[...Array(4)].map((_, i) => <div key={i} className="bg-card-dark rounded-2xl h-24 animate-pulse border border-border-dark" />)}
      </div>
    </div>
  )

  const c = candidate
  const gradient = c.gradient || 'from-primary to-emerald-600'
  const experiences = c.experiences || []
  const skillsList = c.skills || []

  return (
    <div className="bg-background-dark min-h-screen text-slate-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-10 step-enter">
        {!isOwnProfile && (
          <button onClick={() => navigate('/candidates')} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors group">
            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>Back to candidates
          </button>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Profile Summary */}
            <div className="bg-card-dark border border-border-dark rounded-2xl overflow-hidden">
              <div className={`h-24 bg-gradient-to-br ${gradient} opacity-40`} />
              <div className="px-6 pb-6 -mt-10">
                <div className="flex items-end gap-4 mb-4">
                  <div className="w-20 h-20 rounded-full border-4 border-card-dark flex-shrink-0">
                    <div className={`w-full h-full rounded-full bg-gradient-to-tr ${gradient} flex items-center justify-center text-3xl font-bold text-background-dark`}>
                      {c.name?.charAt(0) || '?'}
                    </div>
                  </div>
                  <ScoreRing score={c.ai_score} />
                </div>
                <h1 className="text-2xl font-bold text-white">{c.name}</h1>
                <p className="text-slate-400 text-sm">{c.title}</p>
                {c.location && (
                  <p className="text-slate-500 text-xs flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-sm">location_on</span>{c.location}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {isOwnProfile ? (
                <>
                  <button 
                    onClick={() => navigate('/onboarding')}
                    className="w-full bg-primary text-background-dark hover:scale-[1.02] flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">upload_file</span>
                    Update Resume / Profile
                  </button>
                  <div className="w-full flex items-center justify-center gap-2 py-3 px-6 border border-border-dark bg-border-dark/20 text-slate-400 rounded-xl font-medium text-xs">
                    <span className="material-symbols-outlined text-sm">info</span>
                    This is your public candidate profile
                  </div>
                </>
              ) : (
                <>
                  <button onClick={handleSave}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm transition-all ${saved ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-primary text-background-dark hover:scale-105'}`}>
                    <span className={`material-symbols-outlined text-lg ${saved ? 'fill-icon text-primary' : ''}`}>bookmark</span>
                    {saved ? 'Saved to Shortlist' : 'Save to Shortlist'}
                  </button>
                  <button 
                    onClick={() => showToast("Feature coming soon")}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 border border-border-dark text-slate-300 hover:text-white hover:border-primary rounded-xl font-bold text-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">mail</span>Contact Candidate
                  </button>
                </>
              )}
            </div>

            {/* Meta */}
            <div className="bg-card-dark border border-border-dark rounded-2xl p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Experience</span>
                <span className="text-white font-medium">2+ Years</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Availability</span>
                <span className="text-primary font-medium">2 Weeks</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Notice Period</span>
                <span className="text-white font-medium">Immediate</span>
              </div>
              {c.email && (
                <div className="flex items-center gap-3 text-sm text-slate-400 pt-2 border-t border-border-dark">
                  <span className="material-symbols-outlined text-primary text-lg">mail</span><span>{c.email}</span>
                </div>
              )}
              {c.github && (
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="material-symbols-outlined text-primary text-lg">code</span><span>{c.github}</span>
                </div>
              )}
            </div>

            {/* AI Analysis */}
            <div className="bg-gradient-to-br from-primary/10 to-emerald-600/5 border border-primary/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                <h2 className="text-sm font-bold text-white">AI Analysis</h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Technical Skills', val: Math.min(100, c.ai_score + 1) },
                  { label: 'Experience Fit', val: Math.min(100, c.ai_score - 3) },
                  { label: 'Culture Match', val: Math.min(100, c.ai_score - 7) },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">{m.label}</span>
                      <span className="text-primary font-bold">{m.val}%</span>
                    </div>
                    <div className="h-1.5 bg-border-dark rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-[800ms] ease-out" 
                        style={{ width: barsMounted ? `${m.val}%` : '0%' }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-500 leading-relaxed">Top 2% of candidates matching your active job requirements.</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8">
            <div className="bg-card-dark border border-border-dark rounded-2xl flex flex-col min-h-[600px]">
              {/* Tabs */}
              <div className="flex border-b border-border-dark px-2">
                {['overview', 'experience', 'skills'].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 text-sm font-semibold capitalize transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-white'}`}>
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-8 space-y-8">
                {activeTab === 'overview' && (
                  <>
                    {c.bio && (
                      <section className="space-y-3">
                        <h3 className="text-xl font-bold text-white">Professional Overview</h3>
                        <p className="text-slate-400 leading-relaxed">{c.bio}</p>
                      </section>
                    )}
                    {skillsList.length > 0 && (
                      <section className="space-y-3">
                        <h3 className="text-xl font-bold text-white">Core Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {skillsList.map((s) => (
                            <span key={s} className="px-3 py-1.5 text-xs font-semibold border border-primary text-primary rounded-full bg-primary/5">{s}</span>
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                )}

                {activeTab === 'experience' && (
                  <section className="space-y-3">
                    <h3 className="text-xl font-bold text-white">Work Experience</h3>
                    {experiences.length === 0 ? (
                      <p className="text-slate-500 text-sm">No experience listed.</p>
                    ) : (
                      <div className="relative">
                        <div className="absolute left-5 top-3 bottom-3 w-px bg-border-dark" />
                        <div className="space-y-8">
                          {experiences.map((exp, i) => (
                            <div key={i} className="flex gap-6 relative">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 z-10">
                                <span className="material-symbols-outlined text-primary text-sm">business</span>
                              </div>
                              <div className="flex-1 pb-2">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <div>
                                    <h3 className="text-white font-semibold">{exp.role}</h3>
                                    <p className="text-primary text-sm font-medium">{exp.company}</p>
                                  </div>
                                  <span className="text-slate-500 text-xs whitespace-nowrap bg-border-dark px-2 py-1 rounded-md animate-pulse">
                                    {exp.from}{exp.current ? ' – Present' : exp.to ? ` – ${exp.to}` : ''}
                                  </span>
                                </div>
                                {exp.description && <p className="text-slate-400 text-sm leading-relaxed mt-2">{exp.description}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {activeTab === 'skills' && (
                  <section className="space-y-3">
                    <h3 className="text-xl font-bold text-white">Skills & Technologies</h3>
                    <div className="flex flex-wrap gap-2">
                      {skillsList.map((s) => (
                        <span key={s} className="px-3 py-2 bg-border-dark text-slate-200 text-sm font-medium rounded-xl hover:bg-primary/10 hover:text-primary transition-colors cursor-default">{s}</span>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
