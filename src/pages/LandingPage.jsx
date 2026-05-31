import { Link } from 'react-router-dom'

const features = [
  { icon: 'psychology', title: 'AI Scoring', desc: 'Advanced neural networks evaluate candidate fit based on multi-dimensional data points beyond the resume.' },
  { icon: 'manage_search', title: 'Natural Search', desc: 'Search for talent using conversational language. Just type what you need, our AI understands the nuance.' },
  { icon: 'layers_clear', title: 'Zero Job Posts', desc: 'Skip the manual posting process. Our system continuously sources and refreshes the ideal talent pool for you.' },
]

const steps = [
  { num: '01', title: 'Connect Your Data', desc: 'Integrate your existing ATS, LinkedIn, or internal databases seamlessly. Our AI processing engine ingests and visualises your talent landscape in real-time.', icon: 'hub', glow: 'rgba(63,207,142,0.2)', iconColor: 'text-primary' },
  { num: '02', title: 'AI Analysis', desc: 'Our proprietary algorithms perform a deep analysis of skills, experiences, and potential, creating a high-fidelity match profile for every candidate.', icon: 'insights', glow: 'rgba(59,130,246,0.2)', iconColor: 'text-blue-400' },
  { num: '03', title: 'Discover Top Talent', desc: 'Review ranked matches with confidence. Use our visualisation tools to see how candidates stack up across different skill clusters.', icon: 'person_search', glow: 'rgba(168,85,247,0.2)', iconColor: 'text-purple-400' },
]

const testimonials = [
  { quote: "The AI scoring is scarily accurate. We've cut our screening time by 70% while finding better quality hires.", name: 'Sarah Chen', role: 'Head of Talent @ TechFlow', gradient: 'from-primary to-emerald-600' },
  { quote: 'Natural language search changed everything for us. I can find niche developers just by describing the projects.', name: 'James Wilson', role: 'CTO @ Lumina AI', gradient: 'from-blue-500 to-indigo-600' },
  { quote: 'The AI visualisation of our candidate pipeline gives us insights we never saw in spreadsheets.', name: 'Elena Rodriguez', role: 'Recruiter @ Nexus Corp', gradient: 'from-purple-500 to-pink-600' },
]

export default function LandingPage() {
  return (
    <div className="bg-background-dark text-slate-100 min-h-screen selection:bg-primary/30">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-border-dark">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1">
            <span className="text-xl font-black tracking-tight text-white">Quick</span>
            <span className="text-xl font-black tracking-tight text-primary">Hire</span>
          </Link>
          <div className="hidden md:flex items-center gap-10">
            {['Product', 'Features', 'Pricing', 'About'].map((item) => (
              <a key={item} href="#" className="text-sm font-medium text-slate-400 hover:text-primary transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth" className="px-6 py-2.5 text-sm font-bold text-white hover:text-primary transition-colors">Login</Link>
            <Link to="/auth?mode=signup" className="bg-primary text-background-dark px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-all">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="relative pt-20 overflow-hidden">
        {/* Hero */}
        <section className="relative min-h-[90vh] flex items-center justify-center px-6 mesh-gradient">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-10 size-32 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-10 size-48 bg-blue-600/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-purple-900/10 rounded-full blur-[120px]" />
          </div>
          <div className="relative z-10 max-w-4xl w-full text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Next Gen AI Recruitment
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-[1.1]">
              Hire smarter. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-cyan-400">Discover faster.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
              AI-powered talent discovery with a modern tech aesthetic. Experience the future of recruitment through deep learning and intuitive search.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
              <Link to="/dashboard" className="group relative bg-primary text-background-dark px-10 py-5 rounded-2xl font-bold text-lg button-glow hover:scale-105 transition-all w-full sm:w-auto">
                I'm a Recruiter
                <span className="absolute inset-0 rounded-2xl border-2 border-white/20 pointer-events-none" />
              </Link>
              <Link to="/onboarding" className="px-10 py-5 rounded-2xl font-bold text-lg text-white glass-card hover:bg-white/5 transition-all w-full sm:w-auto">
                I'm a Candidate
              </Link>
            </div>
          </div>
          <div className="absolute top-1/3 left-10 opacity-20 hidden lg:block">
            <span className="material-symbols-outlined text-[80px] text-primary rotate-12">deployed_code</span>
          </div>
          <div className="absolute bottom-1/4 right-20 opacity-20 hidden lg:block">
            <span className="material-symbols-outlined text-[100px] text-blue-400 -rotate-12">category</span>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-white tracking-tight">Everything you need to hire better</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Stop wasting time on manual sourcing. Let AI do the heavy lifting.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="bg-card-dark p-8 rounded-2xl border border-border-dark hover:border-primary/50 transition-colors group">
                <div className="size-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(63,207,142,0.1)]">
                  <span className="material-symbols-outlined text-primary text-3xl">{f.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-7xl mx-auto px-6 py-24 space-y-32">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-white tracking-tight">How It Works</h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
          </div>
          {steps.map((step, i) => (
            <div key={step.num} className={`flex flex-col ${i % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16`}>
              <div className="flex-1 space-y-6">
                <div className="font-mono text-7xl text-primary/20">{step.num}</div>
                <h3 className="text-3xl font-bold text-white">{step.title}</h3>
                <p className="text-slate-400 text-lg leading-relaxed">{step.desc}</p>
              </div>
              <div className="flex-1 relative h-80 w-full bg-card-dark rounded-3xl border border-border-dark flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at center, ${step.glow}, transparent 70%)` }} />
                <span className={`material-symbols-outlined text-[120px] opacity-40 ${step.iconColor}`}>{step.icon}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Stats */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '2.4K+', label: 'Active Candidates', icon: 'group' },
              { value: '98%', label: 'AI Match Accuracy', icon: 'verified' },
              { value: '70%', label: 'Time Saved', icon: 'timer' },
              { value: '500+', label: 'Companies Hiring', icon: 'business' },
            ].map((s) => (
              <div key={s.label} className="bg-card-dark p-6 rounded-2xl border border-border-dark text-center hover:-translate-y-1 transition-transform">
                <span className="material-symbols-outlined text-primary text-3xl mb-3 block">{s.icon}</span>
                <div className="text-3xl font-bold text-white mono-font mb-1">{s.value}</div>
                <div className="text-slate-500 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Trusted by modern teams</h2>
            <p className="text-slate-400">Join the companies redefining how talent is found.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-card-dark p-8 rounded-2xl border border-border-dark shadow-2xl hover:-translate-y-2 transition-transform duration-300">
                <div className="flex gap-1 text-primary mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined fill-icon text-lg">star</span>
                  ))}
                </div>
                <p className="text-slate-300 italic mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className={`size-12 rounded-full bg-gradient-to-tr ${t.gradient}`} />
                  <div>
                    <div className="font-bold text-white">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-6 py-24 mb-20">
          <div className="relative bg-gradient-to-br from-card-dark to-background-dark p-12 md:p-20 rounded-[2.5rem] border border-border-dark overflow-hidden text-center hero-glow">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[100px] rounded-full" />
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to transform your hiring?</h2>
              <p className="text-slate-400 text-lg max-w-xl mx-auto">Join 500+ innovative companies using QuickHire to build their dream teams.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth?mode=signup" className="bg-primary text-background-dark px-10 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all">Start Free Trial</Link>
                <Link to="/candidates" className="bg-white/5 text-white border border-white/10 px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all">Browse Talent</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background-dark border-t border-border-dark py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-background-dark font-black text-sm leading-none">Q</span>
              </div>
              <div className="flex items-center gap-0.5">
                <span className="text-base font-black tracking-tight text-white">Quick</span>
                <span className="text-base font-black tracking-tight text-primary">Hire</span>
              </div>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed">Redefining recruitment with deep-tech AI and dimensional candidate discovery.</p>
          </div>
          {[
            { title: 'Product', items: ['Features', 'Enterprise', 'Integrations', 'Pricing'] },
            { title: 'Company', items: ['About Us', 'Careers', 'Blog', 'Security'] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-bold mb-6">{col.title}</h4>
              <ul className="space-y-4 text-slate-500 text-sm">
                {col.items.map((item) => (
                  <li key={item}><a href="#" className="hover:text-primary transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4 className="text-white font-bold mb-6">Newsletter</h4>
            <p className="text-slate-500 text-sm mb-4">Get the latest hiring insights.</p>
            <div className="flex gap-2">
              <input className="bg-card-dark border border-border-dark rounded-lg text-sm w-full px-3 py-2 focus:outline-none focus:border-primary text-slate-300 placeholder:text-slate-600" placeholder="Email address" type="email" />
              <button className="bg-primary text-background-dark p-2 rounded-lg">
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border-dark flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-xs">© 2025 QuickHire AI. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="text-slate-600 hover:text-primary text-xs transition-colors">Privacy Policy</a>
            <a href="#" className="text-slate-600 hover:text-primary text-xs transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
