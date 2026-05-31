import { useState, useEffect, useRef } from 'react'
import Sidebar from '../components/layout/Sidebar'
import CandidateCard from '../components/CandidateCard'
import { useToast } from '../context/ToastContext'

const PLACEHOLDERS = [
  'Find a senior React engineer with GraphQL experience...',
  'Show me ML engineers who have worked at startups...',
  'Python developers with 5+ years in fintech...',
  'Backend engineers familiar with distributed systems...',
  'Mobile developers with cross-platform expertise...',
]

const MOCK_CANDIDATES = [
  { id: 1, name: 'Alex Rivera', title: 'Senior Frontend Engineer', ai_score: 98, skills: ['React', 'TypeScript', 'GraphQL', 'Next.js', 'Vite'], location: 'San Francisco, CA', bio: 'I build beautiful, performant interfaces that users love. 8+ years shipping production React applications for companies ranging from early-stage startups to Fortune 500s.', experiences: [{ company: 'Stripe', role: 'Senior Engineer', from: '2022-01', current: true, description: 'Led frontend architecture for Stripe Dashboard, improving performance by 40%.' }, { company: 'Airbnb', role: 'Software Engineer', from: '2019-06', to: '2021-12', description: 'Built core booking flow components serving 150M+ users.' }], email: 'alex@example.com', github: 'github.com/alexrivera', gradient: 'from-primary to-emerald-600' },
  { id: 2, name: 'Sarah Jenkins', title: 'Machine Learning Engineer', ai_score: 96, skills: ['Python', 'PyTorch', 'MLOps', 'TensorFlow', 'Kubernetes', 'GCP'], location: 'New York, NY', bio: 'Passionate about turning data into impact. I build and deploy ML systems at scale.', experiences: [{ company: 'OpenAI', role: 'ML Engineer', from: '2023-03', current: true, description: 'Working on model evaluation infrastructure and safety tooling.' }, { company: 'Google Brain', role: 'Research Engineer', from: '2020-08', to: '2023-02', description: 'Published 3 papers on efficient transformers.' }], email: 'sarah@example.com', github: 'github.com/sarahjenkins', gradient: 'from-blue-500 to-indigo-600' },
  { id: 3, name: 'Michael Zhang', title: 'Backend Architect', ai_score: 94, skills: ['Go', 'Kubernetes', 'gRPC', 'Rust', 'PostgreSQL', 'Redis'], location: 'Austin, TX', bio: 'Systems thinker who loves designing distributed backends that are both highly available and a joy to maintain.', experiences: [{ company: 'Uber', role: 'Staff Engineer', from: '2021-04', current: true, description: 'Owns the real-time dispatch infrastructure handling 25M daily trips.' }], email: 'michael@example.com', github: 'github.com/michaelzhang', gradient: 'from-purple-500 to-pink-600' },
  { id: 4, name: 'Elena Rodriguez', title: 'Fullstack Developer', ai_score: 92, skills: ['Next.js', 'PostgreSQL', 'AWS', 'TypeScript', 'Prisma', 'tRPC'], location: 'Miami, FL', bio: "Full-stack engineer who cares deeply about developer experience.", experiences: [{ company: 'Vercel', role: 'Developer Advocate + Engineer', from: '2022-06', current: true, description: 'Building OSS integrations and demonstrating Next.js best practices.' }], email: 'elena@example.com', github: 'github.com/elenarodriguez', gradient: 'from-orange-400 to-red-500' },
  { id: 5, name: 'David Smith', title: 'DevOps Engineer', ai_score: 91, skills: ['Terraform', 'Docker', 'CI/CD', 'Kubernetes', 'AWS', 'Python'], location: 'Seattle, WA', bio: 'DevOps & Platform engineer with a focus on automation, infrastructure as code, and cloud native architectures.', experiences: [{ company: 'HashiCorp', role: 'DevOps Architect', from: '2021-08', current: true, description: 'Designed Terraform provider automation pipeline.' }, { company: 'Netflix', role: 'Senior Platform Engineer', from: '2018-02', to: '2021-07', description: 'Managed container deployment pipelines for thousands of microservices.' }], email: 'david@example.com', github: 'github.com/davidsmith', gradient: 'from-emerald-500 to-teal-600' },
  { id: 6, name: 'Aisha Khan', title: 'Cloud Solutions Architect', ai_score: 89, skills: ['Azure', 'Python', 'Networking', 'Terraform', 'Docker', 'Kubernetes'], location: 'Chicago, IL', bio: 'Cloud architect specializing in enterprise migrations, hybrid-cloud setups, and secure networking architectures.', experiences: [{ company: 'Microsoft', role: 'Solutions Architect', from: '2022-05', current: true, description: 'Advised Fortune 100 partners on large scale migrations to Azure.' }], email: 'aisha@example.com', github: 'github.com/aishakhan', gradient: 'from-cyan-500 to-blue-600' },
  { id: 7, name: 'James Park', title: 'iOS Developer', ai_score: 87, skills: ['Swift', 'SwiftUI', 'Xcode', 'Objective-C', 'Combine', 'Cocoapods'], location: 'Los Angeles, CA', bio: 'Mobile engineer with a passion for clean UI and smooth interactive animations. Native iOS specialist.', experiences: [{ company: 'Apple', role: 'iOS Engineer', from: '2023-01', current: true, description: 'Working on native iOS application components for Apple Store app.' }], email: 'james@example.com', github: 'github.com/jamespark', gradient: 'from-orange-500 to-pink-600' },
  { id: 8, name: 'Priya Patel', title: 'Data Engineer', ai_score: 86, skills: ['Spark', 'Kafka', 'dbt', 'SQL', 'Python', 'Snowflake'], location: 'Boston, MA', bio: 'Data pipelines engineer with expertise in real-time data streaming and robust data warehouses.', experiences: [{ company: 'Snowflake', role: 'Senior Data Engineer', from: '2022-10', current: true, description: 'Optimized real-time ingestion pipelines scaling to petabytes of data.' }], email: 'priya@example.com', github: 'github.com/priyapatel', gradient: 'from-purple-500 to-indigo-600' },
  { id: 9, name: 'Carlos Mendez', title: 'Security Engineer', ai_score: 85, skills: ['Pentesting', 'AWS', 'Zero Trust', 'Python', 'Linux', 'OAuth'], location: 'Denver, CO', bio: 'Security professional focusing on application security, penetration testing, and security automation.', experiences: [{ company: 'CrowdStrike', role: 'Security Analyst', from: '2023-06', current: true, description: 'Conducted penetration tests and security architecture reviews.' }], email: 'carlos@example.com', github: 'github.com/carlosmendez', gradient: 'from-red-500 to-rose-600' },
]

const MOCK_HISTORY = [
  { id: 1, query: 'Senior React engineer with GraphQL', results: 12, created_at: '2025-05-29' },
  { id: 2, query: 'ML engineers fintech experience', results: 7, created_at: '2025-05-28' },
  { id: 3, query: 'Python backend distributed systems', results: 18, created_at: '2025-05-27' },
  { id: 4, query: 'iOS Swift developer 3+ years', results: 5, created_at: '2025-05-26' },
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
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [history, setHistory] = useState(MOCK_HISTORY)
  const [thinking, setThinking] = useState(false)
  const [searched, setSearched] = useState(false)
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [savedIds, setSavedIds] = useState(new Set([1, 2, 3]))
  const inputRef = useRef(null)

  useEffect(() => {
    const timer = setInterval(() => setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length), 3500)
    return () => clearInterval(timer)
  }, [])

  const triggerSearch = (searchQuery) => {
    setQuery(searchQuery)
    executeSearch(searchQuery)
  }

  const executeSearch = (searchQuery) => {
    if (!searchQuery.trim()) return
    setThinking(true)
    setSearched(false)
    setResults([])

    setTimeout(() => {
      const queryLower = searchQuery.toLowerCase()
      let finalResults = MOCK_CANDIDATES.filter(c => {
        const matchName = c.name?.toLowerCase().includes(queryLower)
        const matchTitle = c.title?.toLowerCase().includes(queryLower)
        const matchSkills = c.skills?.some(skill => skill.toLowerCase().includes(queryLower))
        return matchName || matchTitle || matchSkills
      })

      if (finalResults.length === 0) {
        finalResults = [...MOCK_CANDIDATES].sort((a, b) => b.ai_score - a.ai_score).slice(0, 4)
      }

      setResults(finalResults)

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

      setThinking(false)
      setSearched(true)
    }, 2000)
  }

  const handleSearchSubmit = (e) => {
    e?.preventDefault()
    executeSearch(query)
  }

  const handleSave = (candidate) => {
    const isSaved = savedIds.has(candidate.id)
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (isSaved) {
        next.delete(candidate.id)
        showToast("Removed from shortlist")
      } else {
        next.add(candidate.id)
        showToast("Saved to shortlist ✓")
      }
      return next
    })
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
