import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import CandidateCard from '../components/CandidateCard'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const SKILL_OPTIONS = ['React', 'TypeScript', 'Python', 'Go', 'AWS', 'Kubernetes', 'Swift', 'Next.js', 'Docker', 'Terraform']
const EXPERIENCE_LEVELS = ['Junior (0–2 yrs)', 'Mid (3–5 yrs)', 'Senior (6–10 yrs)', 'Lead (10+ yrs)']
const SORT_OPTIONS = ['AI Score ↓', 'AI Score ↑', 'Name A–Z']

export default function CandidateDiscovery() {
  const { showToast } = useToast()
  const { user } = useAuth()
  const userRole = user?.user_metadata?.role || null
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [skillsOpen, setSkillsOpen] = useState(false)
  const [expOpen, setExpOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState([])
  const [selectedExp, setSelectedExp] = useState(null)
  const [sortBy, setSortBy] = useState('AI Score ↓')
  const [savedIds, setSavedIds] = useState(new Set())
  const perPage = 6

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // Fetch candidates from Supabase
      const { data: candData, error: candError } = await supabase
        .from('candidates')
        .select('*')

      if (candData) {
        setCandidates(candData)
      } else {
        console.error('Error fetching candidates:', candError)
      }

      // Fetch saved recruiter shortlists if logged in
      if (user) {
        const { data: savedData, error: savedError } = await supabase
          .from('saved_candidates')
          .select('candidate_id')
          .eq('recruiter_id', user.id)

        if (savedData) {
          setSavedIds(new Set(savedData.map(item => item.candidate_id)))
        } else {
          console.error('Error fetching saved IDs:', savedError)
        }
      }

      setLoading(false)
    }

    fetchData()
  }, [user])

  const handleSave = async (candidate) => {
    if (!user) {
      showToast("Please log in to save candidates")
      return
    }
    const isSaved = savedIds.has(candidate.id)
    if (isSaved) {
      const { error } = await supabase
        .from('saved_candidates')
        .delete()
        .eq('recruiter_id', user.id)
        .eq('candidate_id', candidate.id)

      if (!error) {
        setSavedIds((prev) => {
          const next = new Set(prev)
          next.delete(candidate.id)
          return next
        })
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
        setSavedIds((prev) => {
          const next = new Set(prev)
          next.add(candidate.id)
          return next
        })
        showToast("Saved to shortlist ✓")
      } else {
        showToast("Error saving to shortlist")
      }
    }
  }

  const filtered = candidates
    .filter((c) => selectedSkills.length === 0 || c.skills?.some((s) => selectedSkills.includes(s)))
    .sort((a, b) => {
      if (sortBy === 'AI Score ↑') return a.ai_score - b.ai_score
      if (sortBy === 'Name A–Z') return a.name.localeCompare(b.name)
      return b.ai_score - a.ai_score
    })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)
  const closeAll = () => { setSkillsOpen(false); setExpOpen(false); setSortOpen(false) }

  return (
    <div className="bg-background-dark min-h-screen text-slate-100" onClick={closeAll}>
      <Navbar activePage="browse" />
      <main className="max-w-7xl mx-auto px-6 md:px-10 lg:px-20 py-10">
        <div className="mb-10">
          <h2 className="text-4xl font-extrabold text-white mb-2">Browse Talent</h2>
          <p className="text-slate-400">Discover and recruit the world's best engineering talent with AI-verified scores.</p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-4 mb-10 p-4 bg-card-dark/50 border border-border-dark rounded-xl" onClick={(e) => e.stopPropagation()}>
          <div className="relative">
            <button onClick={() => { setSkillsOpen(!skillsOpen); setExpOpen(false); setSortOpen(false) }}
              className="flex items-center justify-between gap-2 px-4 py-2.5 bg-card-dark border border-border-dark rounded-lg text-sm font-medium text-slate-200 hover:bg-border-dark transition-colors min-w-[140px]">
              <span>Skills {selectedSkills.length > 0 ? `(${selectedSkills.length})` : ''}</span>
              <span className="material-symbols-outlined text-lg">expand_more</span>
            </button>
            {skillsOpen && (
              <div className="absolute top-12 left-0 z-20 bg-card-dark border border-border-dark rounded-xl shadow-2xl p-3 w-56 max-h-60 overflow-y-auto">
                {SKILL_OPTIONS.map((s) => (
                  <label key={s} className="flex items-center gap-2 px-2 py-2 rounded hover:bg-border-dark cursor-pointer text-sm text-slate-300">
                    <input type="checkbox" checked={selectedSkills.includes(s)}
                      onChange={() => {
                        setSelectedSkills((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])
                        setPage(1)
                      }}
                      className="accent-primary" />
                    {s}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => { setExpOpen(!expOpen); setSkillsOpen(false); setSortOpen(false) }}
              className="flex items-center justify-between gap-2 px-4 py-2.5 bg-card-dark border border-border-dark rounded-lg text-sm font-medium text-slate-200 hover:bg-border-dark transition-colors min-w-[170px]">
              <span>{selectedExp || 'Experience Level'}</span>
              <span className="material-symbols-outlined text-lg">expand_more</span>
            </button>
            {expOpen && (
              <div className="absolute top-12 left-0 z-20 bg-card-dark border border-border-dark rounded-xl shadow-2xl p-3 w-56">
                {EXPERIENCE_LEVELS.map((e) => (
                  <button key={e} onClick={() => { setSelectedExp(e); setExpOpen(false) }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-border-dark text-sm text-slate-300">{e}</button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => { setSortOpen(!sortOpen); setSkillsOpen(false); setExpOpen(false) }}
              className="flex items-center justify-between gap-2 px-4 py-2.5 bg-card-dark border border-border-dark rounded-lg text-sm font-medium text-slate-200 hover:bg-border-dark transition-colors min-w-[160px]">
              <span>{sortBy}</span>
              <span className="material-symbols-outlined text-lg">swap_vert</span>
            </button>
            {sortOpen && (
              <div className="absolute top-12 left-0 z-20 bg-card-dark border border-border-dark rounded-xl shadow-2xl p-3 w-48">
                {SORT_OPTIONS.map((o) => (
                  <button key={o} onClick={() => { setSortBy(o); setSortOpen(false) }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-border-dark text-sm text-slate-300">{o}</button>
                ))}
              </div>
            )}
          </div>

          {(selectedSkills.length > 0 || selectedExp) && (
            <button onClick={() => { setSelectedSkills([]); setSelectedExp(null); setPage(1) }}
              className="text-xs text-slate-500 hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">close</span>Clear filters
            </button>
          )}
          <div className="ml-auto">
            <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">{filtered.length} Candidates Found</span>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-card-dark border border-border-dark rounded-xl p-6 animate-pulse h-64" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 step-enter">
            {paginated.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} onSave={userRole === 'recruiter' ? handleSave : null} saved={savedIds.has(candidate.id)} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pb-20">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="flex items-center gap-1 px-2 sm:px-4 py-2 border border-border-dark text-slate-400 hover:text-white hover:border-primary disabled:opacity-40 transition-all rounded-lg text-sm font-medium flex-shrink-0">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
              <span className="hidden sm:inline">Previous</span>
            </button>
            <div className="flex items-center gap-1">
              {(() => {
                const delta = 1
                const pages = []
                for (let i = 1; i <= totalPages; i++) {
                  if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
                    pages.push(i)
                  }
                }
                const result = []
                let prev = null
                for (const p of pages) {
                  if (prev && p - prev > 1) {
                    result.push(<span key={`ellipsis-${p}`} className="w-8 h-8 flex items-center justify-center text-slate-600 text-sm">…</span>)
                  }
                  result.push(
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md text-sm flex-shrink-0 ${page === p ? 'bg-primary text-background-dark font-bold' : 'text-slate-400 hover:text-white'}`}>
                      {p}
                    </button>
                  )
                  prev = p
                }
                return result
              })()}
            </div>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="flex items-center gap-1 px-2 sm:px-4 py-2 border border-border-dark text-slate-400 hover:text-white hover:border-primary disabled:opacity-40 transition-all rounded-lg text-sm font-medium flex-shrink-0">
              <span className="hidden sm:inline">Next</span>
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        )}
      </main>
    </div>
  )
}