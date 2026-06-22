import { useState, useEffect, useRef } from 'react'
import Sidebar from '../components/layout/Sidebar'
import CandidateCard from '../components/CandidateCard'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { searchCandidatesWithAI, fallbackSearch, isGrokConfigured } from '../lib/grok'

const PLACEHOLDERS = [
  'Find a senior React engineer with GraphQL experience...',
  'Show me ML engineers who have worked at startups...',
  'Python developers with 5+ years in fintech...',
  'Backend engineers familiar with distributed systems...',
  'Mobile developers with cross-platform expertise...',
]

/* ───── Thinking Animation ───── */
function ThinkingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6">
      <div className="relative">
        <div className="w-20 h-20 rounded-full flex items-center justify-center grok-pulse"
          style={{ background: 'linear-gradient(135deg, rgba(63,207,142,0.12), rgba(99,102,241,0.12))' }}>
          <span className="material-symbols-outlined text-4xl grok-gradient-text" style={{ WebkitTextFillColor: '#3fcf8e' }}>psychology</span>
        </div>
        <div className="absolute -inset-3 rounded-full border border-primary/20 animate-ping" />
        <div className="absolute -inset-6 rounded-full border border-indigo-500/10 animate-ping" style={{ animationDelay: '0.5s' }} />
      </div>
      <div className="space-y-2 text-center">
        <p className="text-white font-semibold text-lg">QuickHire AI is analyzing your query</p>
        <p className="text-slate-500 text-sm">Semantically searching across all candidates for best matches...</p>
      </div>
      <div className="flex gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-primary dot-bounce" />
        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 dot-bounce" />
        <div className="w-2.5 h-2.5 rounded-full bg-purple-500 dot-bounce" />
      </div>
    </div>
  )
}

/* ───── AI Summary Card ───── */
function AISummaryCard({ summary, queryInterpretation, suggestions, onSuggestionClick }) {
  if (!summary) return null
  return (
    <div className="ai-insight-card rounded-2xl p-6 mb-8 type-reveal">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl grok-gradient flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-white text-xl">auto_awesome</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-white font-bold text-sm">QuickHire AI Insight</h3>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full grok-gradient text-white">AI</span>
          </div>
          {queryInterpretation && (
            <p className="text-xs text-slate-500 mb-2 italic">
              <span className="text-primary font-medium">Understanding:</span> {queryInterpretation}
            </p>
          )}
          <p className="text-sm text-slate-300 leading-relaxed mb-3">{summary}</p>
          {suggestions && suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-slate-500 self-center">Try also:</span>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => onSuggestionClick(s)}
                  className="px-3 py-1 bg-card-dark border border-border-dark text-slate-400 hover:border-primary hover:text-primary rounded-full text-xs transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ───── Main Page ───── */
export default function AISearchPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
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
  const [aiSummary, setAiSummary] = useState('')
  const [aiQueryInterpretation, setAiQueryInterpretation] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [usingFallback, setUsingFallback] = useState(false)
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

  const executeSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return
    setThinking(true)
    setSearched(false)
    setResults([])
    setAiSummary('')
    setAiQueryInterpretation('')
    setAiSuggestions([])
    setUsingFallback(false)

    try {
      // Try Grok AI search first
      const aiResult = await searchCandidatesWithAI(searchQuery, candidates)
      
      setResults(aiResult.results)
      setAiSummary(aiResult.summary)
      setAiQueryInterpretation(aiResult.queryInterpretation)
      setAiSuggestions(aiResult.suggestions)
      setUsingFallback(false)
    } catch (err) {
      console.warn('[AISearch] Grok failed, using fallback:', err.message)
      
      // Fallback to keyword search
      const fallbackResult = fallbackSearch(searchQuery, candidates)
      setResults(fallbackResult.results)
      setAiSummary(fallbackResult.summary)
      setAiQueryInterpretation(fallbackResult.queryInterpretation)
      setAiSuggestions(fallbackResult.suggestions)
      setUsingFallback(true)

      if (err.message === 'GROK_API_KEY_MISSING') {
        showToast('QuickHire AI API key not configured — using keyword search')
      } else {
        console.error('[AISearch] Full error:', err)
        showToast(`QuickHire AI error: ${err.message.slice(0, 120)}`)
      }
    }

    // Save to Supabase search log if logged in
    if (user) {
      await supabase.from('search_history').insert({
        recruiter_id: user.id,
        query: searchQuery,
        results_count: results.length
      })
      fetchRecentSearches()
    } else {
      // Fallback local state history updates for non-logged in users
      setHistory((prev) => {
        const newHistoryItem = {
          id: Date.now(),
          query: searchQuery,
          results: results.length,
          created_at: new Date().toISOString().slice(0, 10)
        }
        const filtered = prev.filter(h => h.query.toLowerCase() !== searchQuery.toLowerCase())
        return [newHistoryItem, ...filtered].slice(0, 6)
      })
    }

    setThinking(false)
    setSearched(true)
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
    <div className="bg-background-dark min-h-screen text-slate-100 flex overflow-x-hidden">
      <Sidebar active="search" isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col lg:overflow-hidden min-w-0">
        <header className="border-b border-border-dark px-4 sm:px-6 md:px-8 py-4 sm:py-5 flex flex-wrap items-center justify-between bg-background-dark/80 backdrop-blur-md sticky top-0 z-40 gap-3 sm:gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white flex-shrink-0"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                AI Talent Search
                <span className="text-xs font-medium px-2 py-0.5 rounded-md grok-gradient text-white">QuickHire AI</span>
              </h1>
              <p className="text-slate-500 text-sm hidden sm:block">
                Powered by QuickHire AI · Natural language semantic search · {candidates.length.toLocaleString()} candidates indexed
              </p>
              <p className="text-slate-500 text-xs sm:hidden">
                QuickHire AI · {candidates.length.toLocaleString()} candidates
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-full ${
            isGrokConfigured 
              ? 'bg-primary/10 border-primary/20' 
              : 'bg-yellow-500/10 border-yellow-500/20'
          }`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isGrokConfigured ? 'bg-primary' : 'bg-yellow-500'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isGrokConfigured ? 'bg-primary' : 'bg-yellow-500'
              }`} />
            </span>
            <span className={`text-xs font-bold ${isGrokConfigured ? 'text-primary' : 'text-yellow-500'}`}>
              {isGrokConfigured ? 'QuickHire AI Active' : 'Keyword Mode'}
            </span>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
            <form onSubmit={handleSearchSubmit} className="mb-8 sm:mb-10">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-2 sm:gap-4 bg-card-dark border border-border-dark group-focus-within:border-primary rounded-xl sm:rounded-2xl px-3 sm:px-5 py-3 sm:py-4 transition-all">
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
                    className="px-3 sm:px-6 py-2 sm:py-2.5 grok-gradient text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2 shadow-lg flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-lg">auto_awesome</span>
                    <span className="hidden sm:inline">{thinking ? 'Searching...' : 'Search'}</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-2 sm:mt-3 ml-1 sm:ml-2">
                <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">Try: "Backend engineers with Rust" · "ML engineers in NY"</p>
                {!isGrokConfigured && (
                  <span className="text-[10px] text-yellow-500/80 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20 self-start">
                    ⚠ API key not set — keyword fallback
                  </span>
                )}
              </div>
            </form>

            {thinking && <ThinkingAnimation />}

            {!thinking && !searched && (
              <div className="text-center py-12 sm:py-20 space-y-4 px-2">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl grok-gradient flex items-center justify-center shadow-2xl shadow-primary/20">
                  <span className="material-symbols-outlined text-white text-4xl sm:text-5xl">manage_search</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-4 sm:mt-6">Ask anything about talent</h2>
                <p className="text-slate-500 max-w-md mx-auto text-sm sm:text-base">
                  QuickHire AI understands natural language. Describe the engineer you're looking for — skills, experience, company background, anything.
                </p>
                <div className="flex flex-wrap justify-center gap-2 pt-4">
                  {['Senior React engineer', 'ML engineer Python', 'DevOps Kubernetes expert', 'iOS Swift developer'].map((s) => (
                    <button key={s} onClick={() => triggerSearch(s)}
                      className="px-4 py-2 bg-card-dark border border-border-dark text-slate-400 hover:border-primary hover:text-primary rounded-full text-sm transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
                <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card-dark border border-border-dark">
                  <div className="w-5 h-5 rounded grok-gradient flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xs">bolt</span>
                  </div>
                  <span className="text-xs text-slate-400">Powered by <span className="grok-gradient-text font-bold">QuickHire AI</span></span>
                </div>
              </div>
            )}

            {searched && !thinking && (
              <div className="step-enter">
                {/* AI Summary Card */}
                <AISummaryCard
                  summary={aiSummary}
                  queryInterpretation={aiQueryInterpretation}
                  suggestions={aiSuggestions}
                  onSuggestionClick={triggerSearch}
                />

                <div className="flex flex-col items-center mb-6">
                  <div className="flex items-center gap-4 w-full">
                    <div className="flex-1 h-px bg-border-dark" />
                    <span className="text-sm text-slate-500 font-medium whitespace-nowrap">
                      Showing <span className="text-primary font-bold">{results.length}</span> best matches for "{query}"
                    </span>
                    <div className="flex-1 h-px bg-border-dark" />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                      usingFallback
                        ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
                        : 'text-primary bg-primary/10 border-primary/20'
                    }`}>
                      {usingFallback 
                        ? `⚡ Keyword fallback · ${results.length} matches`
                        : `✨ QuickHire AI · ${results.length} semantic matches`
                      }
                    </span>
                  </div>
                </div>

                {results.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-full bg-card-dark flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-500 text-3xl">search_off</span>
                    </div>
                    <p className="text-slate-400 font-medium">No matching candidates found</p>
                    <p className="text-slate-600 text-sm max-w-sm mx-auto">Try broadening your search terms or using different keywords.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {results.map((candidate) => (
                      <CandidateCard key={candidate.id} candidate={candidate} onSave={handleSave} saved={savedIds.has(candidate.id)} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-72 border-l border-border-dark bg-sidebar-dark flex-shrink-0 overflow-y-auto p-6">
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
              {history.length === 0 && (
                <p className="text-xs text-slate-600 text-center py-4">No recent searches</p>
              )}
            </div>

            {/* AI Status Panel */}
            <div className="mt-8 p-4 ai-insight-card rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md grok-gradient flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-xs">bolt</span>
                </div>
                <span className="text-xs font-bold text-white">QuickHire AI Status</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Engine</span>
                  <span className="text-xs text-slate-300 font-medium">grok-3-mini</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Status</span>
                  <span className={`text-xs font-medium flex items-center gap-1 ${isGrokConfigured ? 'text-primary' : 'text-yellow-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isGrokConfigured ? 'bg-primary' : 'bg-yellow-500'}`} />
                    {isGrokConfigured ? 'Connected' : 'No API Key'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Candidates</span>
                  <span className="text-xs text-slate-300 font-medium">{candidates.length} indexed</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-4 p-4 bg-card-dark rounded-xl border border-border-dark">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-sm">tips_and_updates</span>
                <span className="text-xs font-bold text-white">AI Tips</span>
              </div>
              <ul className="text-xs text-slate-500 leading-relaxed space-y-1.5">
                <li>• Be specific about skills and experience level</li>
                <li>• Mention company type (startup, FAANG, etc.)</li>
                <li>• Include location preferences if needed</li>
                <li>• Describe the ideal candidate in plain English</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
