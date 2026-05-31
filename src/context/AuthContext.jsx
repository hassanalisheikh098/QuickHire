import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    email: 'recruiter@quickhire.ai',
    user_metadata: {
      full_name: 'Jordan Lee',
      role: 'recruiter'
    }
  })
  const navigate = useNavigate()

  const signUp = async (email, password, metadata = {}) => {
    setUser({
      email: email || 'recruiter@quickhire.ai',
      user_metadata: {
        full_name: metadata.full_name || 'Jordan Lee',
        role: metadata.role || 'recruiter'
      }
    })
    return { data: { user: true }, error: null }
  }

  const signIn = async (email, password) => {
    setUser({
      email: email || 'recruiter@quickhire.ai',
      user_metadata: {
        full_name: 'Jordan Lee',
        role: 'recruiter'
      }
    })
    return { data: { user: true }, error: null }
  }

  const signOut = async () => {
    setUser(null)
    navigate('/')
    return { error: null }
  }

  return (
    <AuthContext.Provider value={{ user, loading: false, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
