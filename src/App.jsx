import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import SelectRolePage from './pages/SelectRolePage'
import OnboardingPage from './pages/OnboardingPage'
import AISearchPage from './pages/AISearchPage'
import CandidateDiscovery from './pages/CandidateDiscovery'
import CandidateProfile from './pages/CandidateProfile'
import RecruiterDashboard from './pages/RecruiterDashboard'
import MessagesPage from './pages/MessagesPage'
import SettingsPage from './pages/SettingsPage'

// Shown while Supabase restores the session on page reload (~200ms window)
function AppLoader() {
  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center">
      <div className="text-center space-y-4">
        <div
          className="w-12 h-12 rounded-full animate-spin mx-auto"
          style={{ border: '4px solid #6366f1', borderTopColor: 'transparent' }}
        />
        <p className="text-slate-400 text-sm">Loading QuickHire...</p>
      </div>
    </div>
  )
}

export default function App() {
  const { loading } = useAuth()

  // Block all routes until Supabase has confirmed/restored the session.
  // Without this gate, pages with `if (!user) navigate('/auth')` guards
  // fire during the ~200ms gap before onAuthStateChange delivers INITIAL_SESSION,
  // causing phantom logouts on every page reload.
  if (loading) return <AppLoader />

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/select-role" element={<SelectRolePage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/search" element={<AISearchPage />} />
      <Route path="/candidates" element={<CandidateDiscovery />} />
      <Route path="/candidates/:id" element={<CandidateProfile />} />
      <Route path="/dashboard" element={<RecruiterDashboard />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
