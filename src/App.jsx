import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import AISearchPage from './pages/AISearchPage'
import CandidateDiscovery from './pages/CandidateDiscovery'
import CandidateProfile from './pages/CandidateProfile'
import RecruiterDashboard from './pages/RecruiterDashboard'
import MessagesPage from './pages/MessagesPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
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
