import { useState, useEffect, useRef } from 'react'
import Sidebar from '../components/layout/Sidebar'
import CandidateCard from '../components/CandidateCard'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const PLACEHOLDERS = [
  'Find a senior React engineer with GraphQL experience...',
  'Show me ML engineers who have worked at startups...',
  'Python developers with 5+ years in fintech...',
  'Backend engineers familiar with distributed systems...',
  'Mobile developers with cross-platform expertise...',
]

function ThinkingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-primary/30 flex items-center justify-center animate-pulse">
          <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
        </div>
        <div className="absolute -inset-2 rounded-full border border-primary/20 animate-ping" />
      </div>
      <div className="space-y-2 text-center">
        <p className="text-white font-semibold">AI is analyzing your query</p>
        <p className="text-slate-500 text-sm">Scanning 2,400+ candidates for best matches...</p>
      </div>
      <div className="flex gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-primary dot-bounce" />
        <div className="w-2.5 h-2.5 rounded-full bg-primary dot-bounce" />
        <div className="w-2.5 h-2.5 rounded-full bg-primary dot-bounce" />
      </div>
    </div>
  )
}

export default function AISearchPage() {
  const { showToast } = useToast()
  const { user } = useAuth()
  const [candidates, setCandidates] = useState([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [history, setHistory] = useState([])
  const [thinking, setThinking] = useState(false)
  const [searched, setSearched] = useState(false)
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [savedIds, setSavedIds] = useState(new Set())
  const inputRef = useRef(null)

  useEffect(() => {
    const timer = setInterval(() => setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length), 3500)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      // Fetch candidates from Supabase
      const { data: candData } = await supabase
        .from('candidates')
        .select('*')
      
      if (candData) {
        setCandidates(candData)
      }

      // Fetch saved shortlists if user is logged in
      if (user) {
        const { data: savedData } = await supabase
          .from('saved_candidates')
          .select('candidate_id')
          .eq('recruiter_id', user.id)
        
        if (savedData) {
          setSavedIds(new Set(savedData.map(item => item.candidate_id)))
        }

        // Fetch search history
        fetchRecentSearches()
      }
    }

    fetchData()
  }, [user])

  const fetchRecentSearches = async () => {
    if (!user) return
    const { data: histData } = await supabase
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
    }
  }

  const triggerSearch = (searchQuery) => {
    setQuery(searchQuery)
    executeSearch(searchQuery)
  }

  const executeSearch = (searchQuery) => {
    if (!searchQuery.trim()) return
    setThinking(true)
    setSearched(false)
    setResults([])

    setTimeout(async () => {
      const queryLower = searchQuery.toLowerCase()
      let finalResults = candidates.filter(c => {
        const matchName = c.name?.toLowerCase().includes(queryLower)
        const matchTitle = c.title?.toLowerCase().includes(queryLower)
        const matchSkills = c.skills?.some(skill => skill.toLowerCase().includes(queryLower))
        return matchName || matchTitle || matchSkills
      })

      if (finalResults.length === 0) {
        finalResults = [...candidates].sort((a, b) => b.ai_score - a.ai_score).slice(0, 4)
      }

      setResults(finalResults)

      // Save to Supabase search log if logged in
      if (user) {
        await supabase.from('search_history').insert({
          recruiter_id: user.id,
          query: searchQuery,
          results_count: finalResults.length
        })
        fetchRecentSearches()
      } else {
        // Fallback local state history updates for non-logged in users
        setHistory((prev) => {
          const newHistoryItem = {
            id: Date.now(),
            query: searchQuery,
            results: finalResults.length,
            created_at: new Date().toISOString().slice(0, 10)
          }
          const filtered = prev.filter(h => h.query.toLowerCase() !== searchQuery.toLowerCase())
          return [newHistoryItem, ...filtered].slice(0, 6)
        })
      }

      setThinking(false)
      setSearched(true)
    }, 1500)
  }

  const handleSearchSubmit = (e) => {
    e?.preventDefault()
    executeSearch(query)
  }

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

  return (
    <div className="bg-background-dark min-h-screen text-slate-100 flex">
      <Sidebar active="search" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border-dark px-8 py-5 flex items-center justify-between bg-background-dark/80 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h1 className="text-xl font-bold text-white">AI Talent Search</h1>
            <p className="text-slate-500 text-sm">Natural language · 2,400+ candidates indexed</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-primary text-xs font-bold">AI Active</span>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto px-8 py-8">
            <form onSubmit={handleSearchSubmit} className="mb-10">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-4 bg-card-dark border border-border-dark group-focus-within:border-primary rounded-2xl px-5 py-4 transition-all">
                  <span className="material-symbols-outlined text-slate-400 text-2xl flex-shrink-0">manage_search</span>
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={PLACEHOLDERS[placeholderIdx]}
                    className="flex-1 bg-transparent text-white placeholder:text-slate-500 focus:outline-none text-base"
                  />
                  {query && (
                    <button type="button" onClick={() => setQuery('')} className="text-slate-500 hover:text-slate-300">
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!query.trim() || thinking}
                    className="px-6 py-2.5 bg-primary text-background-dark rounded-xl font-bold text-sm hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">auto_awesome</span>
                    Search
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-3 ml-2">Try: "Backend engineers with Rust experience" · "ML engineers at startups in NY"</p>
            </form>

            {thinking && <ThinkingAnimation />}

            {!thinking && !searched && (
              <div className="text-center py-20 space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-4xl">manage_search</span>
                </div>
                <h2 className="text-xl font-bold text-white">Ask anything about talent</h2>
                <p className="text-slate-500 max-w-sm mx-auto">Our AI understands natural language. Describe the engineer you're looking for in your own words.</p>
                <div className="flex flex-wrap justify-center gap-2 pt-4">
                  {['Senior React engineer', 'ML engineer Python', 'DevOps Kubernetes expert', 'iOS Swift developer'].map((s) => (
                    <button key={s} onClick={() => triggerSearch(s)}
                      className="px-4 py-2 bg-card-dark border border-border-dark text-slate-400 hover:border-primary hover:text-primary rounded-full text-sm transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searched && !thinking && (
              <div className="step-enter">
                <div className="flex flex-col items-center mb-6">
                  <div className="flex items-center gap-4 w-full">
                    <div className="flex-1 h-px bg-border-dark" />
                    <span className="text-sm text-slate-500 font-medium whitespace-nowrap">
                      Showing <span className="text-primary font-bold">{results.length}</span> best matches for "{query}"
                    </span>
                    <div className="flex-1 h-px bg-border-dark" />
                  </div>
                  <span className="text-xs text-primary font-semibold mt-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                    Showing {results.length} best matches · 98% confidence
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.map((candidate) => (
                    <CandidateCard key={candidate.id} candidate={candidate} onSave={handleSave} saved={savedIds.has(candidate.id)} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-72 border-l border-border-dark bg-sidebar-dark flex-shrink-0 overflow-y-auto p-6">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-4">Recent Searches</h3>
            <div className="space-y-2">
              {history.map((h) => (
                <button key={h.id} onClick={() => triggerSearch(h.query)}
                  className="w-full text-left p-3 rounded-xl hover:bg-card-dark transition-colors group">
                  <p className="text-sm text-slate-300 group-hover:text-white transition-colors line-clamp-2 mb-1">{h.query}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="material-symbols-outlined text-xs">group</span>
                    {h.results} results · {h.created_at}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-8 p-4 bg-card-dark rounded-xl border border-border-dark">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-sm">tips_and_updates</span>
                <span className="text-xs font-bold text-white">AI Tip</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Be specific about years of experience, company type, or tech stack for better matches.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
