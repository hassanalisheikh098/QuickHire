import { Routes, Route, Navigate, useParams } from 'react-router-dom'
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

/**
 * ProtectedRoute — role-based route guard.
 *
 * Props:
 *   requiredRole  – 'recruiter' | 'candidate' | undefined
 *                   undefined = any authenticated user with a role can access
 *   loginOnly     – if true, only checks login (skips role check entirely).
 *                   Used for /select-role which users reach *before* having a role.
 */
function ProtectedRoute({ children, requiredRole, loginOnly = false }) {
  const { user } = useAuth()
  const role = user?.user_metadata?.role || null

  // 1. Not logged in → go to auth
  if (!user) return <Navigate to="/auth" replace />

  // 2. loginOnly mode (e.g. /select-role) — skip role checks
  if (loginOnly) return children

  // 3. Logged in but no role yet → go pick one
  if (!role) return <Navigate to="/select-role" replace />

  // 4. Role mismatch → redirect to their own home
  if (requiredRole && role !== requiredRole) {
    if (role === 'candidate') {
      return <Navigate to={`/candidates/${user.id}`} replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  return children
}

/**
 * Guard for /candidates/:id
 * - Recruiters can view any candidate profile
 * - Candidates can only view their own profile
 */
function CandidateProfileGuard() {
  const { user } = useAuth()
  const { id } = useParams()
  const role = user?.user_metadata?.role || null

  if (!user) return <Navigate to="/auth" replace />
  if (!role) return <Navigate to="/select-role" replace />

  // Candidates can only view their own profile
  if (role === 'candidate' && id !== user.id) {
    return <Navigate to={`/candidates/${user.id}`} replace />
  }

  return <CandidateProfile />
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
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />

      {/* Login required, no role check (user may not have a role yet) */}
      <Route path="/select-role" element={
        <ProtectedRoute loginOnly>
          <SelectRolePage />
        </ProtectedRoute>
      } />

      {/* Recruiter-only routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute requiredRole="recruiter">
          <RecruiterDashboard />
        </ProtectedRoute>
      } />
      <Route path="/search" element={
        <ProtectedRoute requiredRole="recruiter">
          <AISearchPage />
        </ProtectedRoute>
      } />
      <Route path="/candidates" element={
        <ProtectedRoute requiredRole="recruiter">
          <CandidateDiscovery />
        </ProtectedRoute>
      } />

      {/* Candidate profile — special guard (recruiters: any, candidates: own only) */}
      <Route path="/candidates/:id" element={<CandidateProfileGuard />} />

      {/* Candidate-only routes */}
      <Route path="/onboarding" element={
        <ProtectedRoute requiredRole="candidate">
          <OnboardingPage />
        </ProtectedRoute>
      } />

      {/* Both roles — just requires login + role */}
      <Route path="/messages" element={
        <ProtectedRoute>
          <MessagesPage />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

