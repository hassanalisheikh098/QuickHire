import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const SKILL_SUGGESTIONS = ['React', 'TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Node.js', 'Next.js', 'Vue', 'Angular', 'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'Swift', 'Kotlin', 'Flutter', 'Terraform', 'CI/CD', 'Machine Learning', 'PyTorch', 'TensorFlow', 'Spark']
const STEPS = ['Personal Info', 'Skills', 'Experience', 'Preview']

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${i === current ? 'bg-primary text-background-dark' : i < current ? 'bg-primary/20 text-primary' : 'bg-card-dark text-slate-500 border border-border-dark'}`}>
            {i < current ? <span className="material-symbols-outlined text-sm">check</span> : <span>{i + 1}</span>}
            <span className="hidden sm:inline">{step}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`w-8 h-px mx-1 ${i < current ? 'bg-primary' : 'bg-border-dark'}`} />}
        </div>
      ))}
    </div>
  )
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState(user?.user_metadata?.full_name || '')
  const [title, setTitle] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')
  const [experiences, setExperiences] = useState([{ company: '', role: '', from: '', to: '', current: false, description: '' }])

  const addSkill = (s) => { const t = s.trim(); if (t && !skills.includes(t)) setSkills((prev) => [...prev, t]); setSkillInput('') }
  const removeSkill = (s) => setSkills((prev) => prev.filter((x) => x !== s))
  const updateExp = (i, field, value) => setExperiences((prev) => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e))
  const addExp = () => setExperiences((prev) => [...prev, { company: '', role: '', from: '', to: '', current: false, description: '' }])
  const removeExp = (i) => { if (experiences.length > 1) setExperiences((prev) => prev.filter((_, idx) => idx !== i)) }
  const filteredSuggestions = SKILL_SUGGESTIONS.filter((s) => s.toLowerCase().includes(skillInput.toLowerCase()) && !skills.includes(s)).slice(0, 8)

  const handleContinue = () => {
    if (step === 0) {
      if (!name.trim() || !title.trim()) {
        setError('Please fill in both Name and Professional Title.')
        return
      }
    }
    setError('')
    setStep((s) => s + 1)
  }

  const handleFinish = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      navigate('/candidates')
    }, 600)
  }

  return (
    <div className="min-h-screen bg-background-dark text-slate-100">
      <header className="border-b border-border-dark bg-background-dark/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-1">
          <span className="text-xl font-black tracking-tight text-white">Quick</span>
          <span className="text-xl font-black tracking-tight text-primary">Hire</span>
        </Link>
        <StepIndicator current={step} />
        <div className="text-sm text-slate-500">Step {step + 1} of {STEPS.length}</div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="w-full bg-border-dark rounded-full h-1 mb-12 overflow-hidden">
          <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm mb-6 animate-stepEnter">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </div>
        )}

        {/* Step 0 */}
        {step === 0 && (
          <div className="step-enter space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Tell us about yourself</h1>
              <p className="text-slate-400">This will form your public candidate profile.</p>
            </div>
            <div className="space-y-5">
              {[
                { label: 'Full Name *', value: name, setter: setName, placeholder: 'Alex Rivera' },
                { label: 'Professional Title *', value: title, setter: setTitle, placeholder: 'Senior Frontend Engineer' },
                { label: 'Location', value: location, setter: setLocation, placeholder: 'San Francisco, CA' },
              ].map(({ label, value, setter, placeholder }) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
                  <input value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder}
                    className="w-full bg-card-dark border border-border-dark rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="Tell recruiters what makes you unique..."
                  className="w-full bg-card-dark border border-border-dark rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition resize-none" />
              </div>
            </div>
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div className="step-enter space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Your skills</h1>
              <p className="text-slate-400">Add the technologies and tools you work with.</p>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Add a skill</label>
                <div className="flex gap-2">
                  <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput) } }}
                    placeholder="Type a skill and press Enter..."
                    className="flex-1 bg-card-dark border border-border-dark rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition" />
                  <button onClick={() => addSkill(skillInput)} className="px-4 py-3 bg-primary text-background-dark rounded-xl font-bold hover:scale-105 transition-all">Add</button>
                </div>
                {skillInput && filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card-dark border border-border-dark rounded-xl shadow-2xl z-10 p-2">
                    {filteredSuggestions.map((s) => (
                      <button key={s} onClick={() => addSkill(s)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-border-dark text-sm text-slate-300 transition-colors">{s}</button>
                    ))}
                  </div>
                )}
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-sm font-medium">
                      {s}
                      <button onClick={() => removeSkill(s)} className="hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div>
                <p className="text-xs text-slate-500 mb-3 uppercase tracking-widest font-bold">Suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).slice(0, 16).map((s) => (
                    <button key={s} onClick={() => addSkill(s)} className="px-3 py-1.5 bg-card-dark border border-border-dark text-slate-400 hover:border-primary hover:text-primary rounded-full text-xs font-medium transition-colors">+ {s}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="step-enter space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Work Experience</h1>
              <p className="text-slate-400">Add your most relevant positions.</p>
            </div>
            <div className="space-y-6">
              {experiences.map((exp, i) => (
                <div key={i} className="bg-card-dark border border-border-dark rounded-2xl p-6 space-y-4 relative">
                  {experiences.length > 1 && (
                    <button onClick={() => removeExp(i)} className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    {[['Company', 'company', 'Acme Corp'], ['Role', 'role', 'Senior Engineer']].map(([label, field, ph]) => (
                      <div key={field}>
                        <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
                        <input value={exp[field]} onChange={(e) => updateExp(i, field, e.target.value)} placeholder={ph}
                          className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary text-sm transition" />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">From</label>
                      <input type="month" value={exp.from} onChange={(e) => updateExp(i, 'from', e.target.value)}
                        className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-primary text-sm transition [color-scheme:dark]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">To</label>
                      <input type="month" value={exp.to} onChange={(e) => updateExp(i, 'to', e.target.value)} disabled={exp.current}
                        className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-primary text-sm transition disabled:opacity-40 [color-scheme:dark]" />
                      <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <input type="checkbox" checked={exp.current} onChange={(e) => updateExp(i, 'current', e.target.checked)} className="accent-primary" />
                        <span className="text-xs text-slate-400">Current role</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                    <textarea value={exp.description} onChange={(e) => updateExp(i, 'description', e.target.value)} rows={3} placeholder="Key achievements and responsibilities..."
                      className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary text-sm transition resize-none" />
                  </div>
                </div>
              ))}
              <button onClick={addExp} className="w-full py-3 border border-dashed border-border-dark text-slate-500 hover:border-primary hover:text-primary rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg">add</span>Add another position
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="step-enter space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Your Profile Preview</h1>
              <p className="text-slate-400">This is how recruiters will see you. Looking great!</p>
            </div>
            <div className="bg-card-dark border border-border-dark rounded-2xl overflow-hidden">
              <div className="relative h-32 bg-gradient-to-br from-primary/20 via-emerald-600/10 to-blue-600/10">
                <div className="absolute -bottom-12 left-8">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-emerald-600 border-4 border-card-dark flex items-center justify-center text-4xl font-bold text-background-dark">
                    {name?.charAt(0) || 'A'}
                  </div>
                </div>
              </div>
              <div className="pt-16 pb-8 px-8 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{name || 'Your Name'}</h2>
                  <p className="text-slate-400">{title || 'Your Title'}</p>
                  {location && <p className="text-slate-500 text-sm flex items-center gap-1 mt-1"><span className="material-symbols-outlined text-sm">location_on</span>{location}</p>}
                </div>
                {bio && <p className="text-slate-400 text-sm leading-relaxed">{bio}</p>}
                {skills.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s) => <span key={s} className="px-3 py-1 bg-border-dark text-slate-200 text-xs font-medium rounded-full">{s}</span>)}
                    </div>
                  </div>
                )}
                {experiences.filter((e) => e.company).length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-3">Experience</p>
                    <div className="space-y-3">
                      {experiences.filter((e) => e.company).map((exp, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-primary text-sm">business</span>
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">{exp.role}</p>
                            <p className="text-slate-400 text-xs">{exp.company} · {exp.from}{exp.current ? ' – Present' : exp.to ? ` – ${exp.to}` : ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/10 rounded-xl">
                  <span className="material-symbols-outlined text-primary">auto_awesome</span>
                  <p className="text-sm text-primary font-medium">AI Score will be calculated after profile completion.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-10">
          {step > 0 ? (
            <button onClick={() => { setStep((s) => s - 1); setError('') }} className="flex items-center gap-2 px-6 py-3 border border-border-dark text-slate-300 hover:text-white hover:border-primary rounded-xl font-medium transition-all">
              <span className="material-symbols-outlined">arrow_back</span>Back
            </button>
          ) : (
            <Link to="/" className="flex items-center gap-2 px-6 py-3 border border-border-dark text-slate-300 hover:text-white rounded-xl font-medium transition-all">Cancel</Link>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={handleContinue}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-background-dark rounded-xl font-bold hover:scale-105 transition-all">
              Continue<span className="material-symbols-outlined">arrow_forward</span>
            </button>
          ) : (
            <button onClick={handleFinish} disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-background-dark rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-60">
              {saving ? <><span className="material-symbols-outlined animate-spin">progress_activity</span>Saving...</> : <><span className="material-symbols-outlined">check_circle</span>Finish & Discover Talent</>}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
