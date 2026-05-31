import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import CandidateCard from '../components/CandidateCard'
import { useToast } from '../context/ToastContext'

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

const SKILL_OPTIONS = ['React', 'TypeScript', 'Python', 'Go', 'AWS', 'Kubernetes', 'Swift', 'Next.js', 'Docker', 'Terraform']
const EXPERIENCE_LEVELS = ['Junior (0–2 yrs)', 'Mid (3–5 yrs)', 'Senior (6–10 yrs)', 'Lead (10+ yrs)']
const SORT_OPTIONS = ['AI Score ↓', 'AI Score ↑', 'Name A–Z']

export default function CandidateDiscovery() {
  const { showToast } = useToast()
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [skillsOpen, setSkillsOpen] = useState(false)
  const [expOpen, setExpOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState([])
  const [selectedExp, setSelectedExp] = useState(null)
  const [sortBy, setSortBy] = useState('AI Score ↓')
  const [savedIds, setSavedIds] = useState(new Set([1, 2, 3]))
  const perPage = 6

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setCandidates(MOCK_CANDIDATES)
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

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
              <CandidateCard key={candidate.id} candidate={candidate} onSave={handleSave} saved={savedIds.has(candidate.id)} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-6 pb-20">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="flex items-center gap-2 px-6 py-2 border border-border-dark text-slate-400 hover:text-white hover:border-primary disabled:opacity-40 transition-all rounded-lg text-sm font-medium">
              <span className="material-symbols-outlined text-lg">chevron_left</span>Previous
            </button>
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-sm ${page === i + 1 ? 'bg-primary text-background-dark font-bold' : 'text-slate-400 hover:text-white'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="flex items-center gap-2 px-6 py-2 border border-border-dark text-slate-400 hover:text-white hover:border-primary disabled:opacity-40 transition-all rounded-lg text-sm font-medium">
              Next<span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
