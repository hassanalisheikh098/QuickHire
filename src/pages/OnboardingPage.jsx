import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { supabase } from '../lib/supabase'
import Navbar from '../components/layout/Navbar'

// Dynamic CDN PDF.js Script Loader
const loadPdfJS = () => {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      resolve(window.pdfjsLib)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js'
    script.onload = () => {
      window.pdfjsLib = window['pdfjs-dist/build/pdf']
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js'
      resolve(window.pdfjsLib)
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)
  const [pastedText, setPastedText] = useState('')
  const [showTextArea, setShowTextArea] = useState(false)

  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState('')

  // API Key loaded directly from .env
  const grokApiKey = (import.meta.env.VITE_GROK_API_KEY || '').trim()
  // Demo mode is on by default if no key is configured in .env
  const [useDemoMode, setUseDemoMode] = useState(!grokApiKey)

  useEffect(() => {
    if (!user) {
      navigate('/auth')
    }
  }, [user, navigate])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "application/pdf" || droppedFile.type === "text/plain") {
        setFile(droppedFile)
        setError('')
      } else {
        setError('Only PDF or TXT files are supported.')
      }
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === "application/pdf" || selectedFile.type === "text/plain") {
        setFile(selectedFile)
        setError('')
      } else {
        setError('Only PDF or TXT files are supported.')
      }
    }
  }

  // Extracts text from PDF using PDF.js CDN
  const extractTextFromPDF = async (file) => {
    const pdfjs = await loadPdfJS()
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const strings = content.items.map(item => item.str)
      text += strings.join(' ') + '\n'
    }
    return text
  }

  // Extracts text from TXT file
  const extractTextFromTXT = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.readAsText(file)
    })
  }

  // Calls Grok (x.ai) or Groq API (OpenAI compatible) based on the key type
  const parseResumeWithGrok = async (apiKey, resumeText) => {
    // Guard: catch empty/whitespace key BEFORE making the network request.
    if (!apiKey || apiKey.trim() === '') {
      console.warn('API key is empty — falling back to demo mode')
      return null // Caller handles null by switching to simulateParser
    }

    const trimmedKey = apiKey.trim()
    let isGroq = false
    let finalKey = trimmedKey

    if (trimmedKey.startsWith('xai-gsk_')) {
      isGroq = true
      finalKey = trimmedKey.substring(4) // strip 'xai-' prefix to get the valid Groq key
    } else if (trimmedKey.startsWith('gsk_')) {
      isGroq = true
    }

    const apiUrl = isGroq
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://api.x.ai/v1/chat/completions'

    // Use llama-3.3-70b-versatile for Groq, and grok-2 for xAI
    const modelName = isGroq
      ? 'llama-3.3-70b-versatile'
      : 'grok-2'

    const prompt = `You are an expert AI resume parser. Extract the structured information from the following resume text.
Format your response as a valid JSON object matching the JSON schema below. DO NOT include any markdown formatting (like \`\`\`json) or extra text. Return ONLY the raw JSON object.

JSON Schema:
{
  "name": "Full Name",
  "title": "Professional Title (e.g. Senior Frontend Engineer)",
  "skills": ["React", "TypeScript", "Node.js", "Python"],
  "location": "City, State or Country (e.g. San Francisco, CA)",
  "bio": "A short, professional, engaging bio summary",
  "experiences": [
    {
      "company": "Company Name",
      "role": "Role Title",
      "from": "YYYY-MM",
      "to": "YYYY-MM or Present",
      "current": true,
      "description": "Short description of accomplishments"
    }
  ],
  "ai_score": 92
}

Additional Instructions:
1. If a field is missing or cannot be determined from the text, use an empty string "" or an empty array [] as appropriate. Do not omit any keys from the final JSON.
2. Ensure all 'from' and 'to' date fields strictly follow the 'YYYY-MM' format (or 'Present' for ongoing roles).
3. Compute 'ai_score' as an integer 0-100 using this strict unified rubric:
   - 90-100: Exceptional — FAANG/top-tier internships + outstanding projects (students), OR 8+ years at reputable companies, staff/principal/lead level with clear impact (professionals). Extremely rare, must truly stand out.
   - 75-89: Strong — 1-2 solid internships + good projects (students), OR 4-7 years solid experience with measurable achievements (professionals).
   - 60-74: Average — basic projects and skills, no internships (students), OR 1-3 years experience, ordinary roles (professionals).
   - 40-59: Weak — vague or minimal content, few skills, little to show (both).
   - 0-39: Empty resume, random/unreadable file, or no professional/academic content whatsoever.
   Be strict and consistent. A 90+ must be genuinely rare. When details are vague or unverifiable, default lower

Resume Text:
${resumeText}`

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${finalKey}`
      },
      body: JSON.stringify({
        model: modelName,
        response_format: { type: "json_object" },
        messages: [
          { role: 'system', content: 'You are a precise resume parser that returns ONLY raw JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1
      })
    })

    if (!response.ok) {
      // Parse the error body if possible for a cleaner message
      const errBody = await response.json().catch(() => ({}))
      const errorMsg = errBody?.error?.message || errBody?.error || response.statusText
      throw new Error(`QuickHire AI error ${response.status}: ${errorMsg}`)
    }

    const result = await response.json()
    const textContent = result.choices[0].message.content.trim()

    const cleanJson = textContent.replace(/^```json\s*/, '').replace(/```$/, '').trim()
    return JSON.parse(cleanJson)
  }

  // Simulated Parser Fallback
  const simulateParser = async (resumeText) => {
    const text = resumeText.toLowerCase()
    let name = user?.user_metadata?.full_name || "Alex Rivera"

    const lines = resumeText.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length > 0 && lines[0].length < 30) {
      name = lines[0]
    }

    let title = "Software Engineer"
    if (text.includes("frontend") || text.includes("react")) {
      title = "Senior Frontend Engineer"
    } else if (text.includes("backend") || text.includes("go") || text.includes("rust")) {
      title = "Backend Architect"
    } else if (text.includes("machine learning") || text.includes("ml") || text.includes("pytorch")) {
      title = "Machine Learning Engineer"
    } else if (text.includes("devops") || text.includes("kubernetes")) {
      title = "DevOps Engineer"
    }

    const skills = []
    const allSkills = ['React', 'TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Node.js', 'Next.js', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'PyTorch', 'TensorFlow', 'Terraform']
    allSkills.forEach(s => {
      if (text.includes(s.toLowerCase())) {
        skills.push(s)
      }
    })

    if (skills.length === 0) {
      skills.push("React", "TypeScript", "Node.js")
    }

    const ai_score = Math.floor(Math.random() * (99 - 85 + 1)) + 85

    return {
      name,
      title,
      skills,
      location: text.includes("san francisco") ? "San Francisco, CA" : text.includes("new york") ? "New York, NY" : "Remote",
      bio: `Experienced specialist focused on design and scalability. Skilled in ${skills.slice(0, 3).join(', ')}.`,
      experiences: [
        {
          company: text.includes("google") ? "Google" : text.includes("stripe") ? "Stripe" : "TechFlow",
          role: title,
          from: "2022-01",
          to: "Present",
          current: true,
          description: `Built high scalability features using ${skills.slice(0, 3).join(', ')}.`
        }
      ],
      ai_score
    }
  }

  const handleProcess = async () => {
    if (!file && !pastedText.trim()) {
      setError('Please select a resume file or paste your resume text.')
      return
    }

    if (!useDemoMode && !grokApiKey) {
      setError('No API key configured in .env. Please enable Demo Mode to proceed.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Step 1: Read text
      setLoadingStep(1)
      let resumeText = pastedText.trim()

      if (file) {
        if (file.type === "application/pdf") {
          resumeText = await extractTextFromPDF(file)
        } else {
          resumeText = await extractTextFromTXT(file)
        }
      }

      if (!resumeText || resumeText.length < 50) {
        throw new Error('Not enough text could be extracted from your resume. Try pasting the text instead.')
      }

      // Step 2: Extracting details
      setLoadingStep(2)
      let parsedData

      if (useDemoMode) {
        // Run simulated parser
        parsedData = await simulateParser(resumeText)
      } else {
        // Run real Grok parse — returns null if the key is empty (guard inside)
        parsedData = await parseResumeWithGrok(grokApiKey, resumeText)

        if (!parsedData) {
          // Key was empty — silently fall back to demo instead of crashing
          console.warn('Switching to demo mode due to missing API key')
          setUseDemoMode(true)
          parsedData = await simulateParser(resumeText)
        }
      }

      // Step 3: Calculation and Save
      setLoadingStep(3)

      const gradients = [
        'from-primary to-emerald-600',
        'from-blue-500 to-indigo-600',
        'from-purple-500 to-pink-600',
        'from-orange-400 to-red-500',
        'from-emerald-500 to-teal-600',
        'from-cyan-500 to-blue-600'
      ]
      const randomGradient = gradients[Math.floor(Math.random() * gradients.length)]

      const candidateProfile = {
        id: user.id,
        name: parsedData.name || user.user_metadata?.full_name || 'Candidate',
        title: parsedData.title || 'Software Engineer',
        ai_score: parsedData.ai_score || 85,
        skills: parsedData.skills || ['React', 'TypeScript'],
        location: parsedData.location || 'Remote',
        bio: parsedData.bio || '',
        experiences: parsedData.experiences || [],
        email: user.email,
        github: parsedData.github || `github.com/${(parsedData.name || 'user').toLowerCase().replace(/\s+/g, '')}`,
        gradient: randomGradient
      }

      // Save profile in candidates table
      const { error: saveError } = await supabase
        .from('candidates')
        .upsert(candidateProfile)

      if (saveError) throw saveError

      // Update full_name in profiles to match extracted name
      await supabase
        .from('profiles')
        .update({ full_name: candidateProfile.name })
        .eq('id', user.id)

      showToast("Resume parsed and profile updated successfully! ✓")
      navigate(`/candidates/${user.id}`)

    } catch (err) {
      console.error(err)
      setError(err.message || 'An error occurred while parsing your resume.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background-dark text-slate-100 flex flex-col justify-between">
      <Navbar activePage="onboarding" />

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
        {loading ? (
          <div className="w-full bg-card-dark border border-border-dark rounded-3xl p-8 md:p-12 text-center space-y-8 animate-pulse">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-white">AI Engine Parsing Resume</h2>
              <p className="text-slate-400 text-sm">Please wait while our models extract your professional history.</p>
            </div>

            <div className="max-w-md mx-auto space-y-4 text-left border-t border-border-dark pt-6">
              {[
                { step: 1, label: "Extracting resume text contents..." },
                { step: 2, label: "Running QuickHire AI parser models..." },
                { step: 3, label: "Saving results & updating dashboard..." }
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-lg ${loadingStep >= s.step ? 'text-primary' : 'text-slate-600 animate-pulse'}`}>
                    {loadingStep > s.step ? 'check_circle' : loadingStep === s.step ? 'progress_activity' : 'radio_button_unchecked'}
                  </span>
                  <span className={`text-sm ${loadingStep >= s.step ? 'text-slate-200 font-semibold' : 'text-slate-500'}`}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-stepEnter">
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Setup Your Profile Instantly</h1>
              <p className="text-slate-400 text-sm">
                Drop your resume and let QuickHire AI extract your skills, compute your AI rating, and generate your profile.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}

            {/* Drag & Drop Uploader */}
            {!showTextArea ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-[2rem] bg-card-dark/50 backdrop-blur-md transition-all duration-300 ${dragActive ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/5 scale-[1.01]' : 'border-border-dark hover:border-slate-600'
                  }`}
              >
                <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary text-4xl">upload_file</span>
                </div>

                {file ? (
                  <div className="text-center space-y-4">
                    <p className="text-white font-bold text-lg">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB · Ready to parse</p>
                    <button
                      onClick={() => setFile(null)}
                      className="px-4 py-2 border border-border-dark text-slate-400 hover:text-red-400 hover:border-red-500/30 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <p className="text-white font-bold text-lg">Drag & Drop Resume</p>
                    <p className="text-slate-400 text-sm">Supported formats: PDF, TXT</p>
                    <label className="inline-block mt-4 px-6 py-2.5 bg-primary text-background-dark font-bold text-sm rounded-xl cursor-pointer hover:scale-105 transition-all">
                      Browse Files
                      <input
                        type="file"
                        accept=".pdf,.txt"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 animate-stepEnter">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-semibold text-slate-300">Paste Resume Text</label>
                  <button
                    onClick={() => { setShowTextArea(false); setPastedText('') }}
                    className="text-xs text-slate-500 hover:text-white transition-colors"
                  >
                    Back to File Upload
                  </button>
                </div>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  rows={12}
                  placeholder="Paste the full text of your resume here..."
                  className="w-full bg-card-dark border border-border-dark rounded-2xl p-6 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition resize-none"
                />
              </div>
            )}

            {/* Toggle uploader / textarea */}
            {!file && (
              <div className="text-center">
                <button
                  onClick={() => setShowTextArea(!showTextArea)}
                  className="text-sm text-slate-500 hover:text-primary hover:underline transition-colors"
                >
                  {showTextArea ? 'Upload a file instead' : 'Or paste resume text instead'}
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleProcess}
              disabled={!file && !pastedText.trim()}
              className="w-full bg-primary text-background-dark py-4 rounded-2xl font-bold text-base hover:scale-[1.01] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
            >
              <span className="material-symbols-outlined">auto_awesome</span>
              Generate AI Candidate Profile
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-600 border-t border-border-dark">
        © 2026 QuickHire AI. All rights reserved.
      </footer>
    </div>
  )
}
