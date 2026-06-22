import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function Navbar({ activePage }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="sticky top-4 left-0 right-0 z-50 px-6 max-w-5xl mx-auto w-full">
      <header className="w-full bg-slate-950/40 backdrop-blur-xl border border-border-dark shadow-2xl rounded-full px-6 md:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-1">
            <span className="text-xl font-black tracking-tight text-white">Quick</span>
            <span className="text-xl font-black tracking-tight text-primary">Hire</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-8">
            {user && user.user_metadata?.role === 'candidate' ? (
              <>
                <Link
                  to="/candidates"
                  className={`text-sm font-medium transition-colors ${activePage === 'browse' ? 'text-white border-b-2 border-primary pb-1' : 'text-slate-400 hover:text-white'}`}
                >
                  Browse Talent
                </Link>
                <Link
                  to={`/candidates/${user.id}`}
                  className={`text-sm font-medium transition-colors ${activePage === 'profile' ? 'text-white border-b-2 border-primary pb-1' : 'text-slate-400 hover:text-white'}`}
                >
                  My Profile
                </Link>
                <Link
                  to="/onboarding"
                  className={`text-sm font-medium transition-colors ${activePage === 'onboarding' ? 'text-white border-b-2 border-primary pb-1' : 'text-slate-400 hover:text-white'}`}
                >
                  Update Resume
                </Link>
              </>
            ) : user && user.user_metadata?.role === 'recruiter' ? (
              <>
                <Link
                  to="/candidates"
                  className={`text-sm font-medium transition-colors ${activePage === 'browse' ? 'text-white border-b-2 border-primary pb-1' : 'text-slate-400 hover:text-white'}`}
                >
                  Browse Talent
                </Link>
                <Link
                  to="/search"
                  className={`text-sm font-medium transition-colors ${activePage === 'search' ? 'text-white border-b-2 border-primary pb-1' : 'text-slate-400 hover:text-white'}`}
                >
                  AI Search
                </Link>
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors ${activePage === 'dashboard' ? 'text-white border-b-2 border-primary pb-1' : 'text-slate-400 hover:text-white'}`}
                >
                  Dashboard
                </Link>
              </>
            ) : null}
          </nav>
        </div>
        <div className="flex items-center gap-6">
          {user && user.user_metadata?.role === 'recruiter' && (
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input
                className="bg-card-dark border border-border-dark rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none w-64 text-slate-100 placeholder:text-slate-500"
                placeholder="Search talent..."
                type="text"
                onKeyDown={(e) => e.key === 'Enter' && navigate('/candidates')}
              />
            </div>
          )}
          
          {/* Notification bell dropdown */}
          <div ref={dropdownRef} className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-slate-400 hover:text-white transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-card-dark border border-border-dark rounded-xl shadow-2xl p-4 z-50 space-y-3 animate-stepEnter">
                <div className="flex items-center justify-between border-b border-border-dark pb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                  <span className="text-[10px] text-primary font-bold hover:underline cursor-pointer">Mark all read</span>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-3 hover:bg-white/5 p-2 rounded-lg transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-emerald-600 flex items-center justify-center text-background-dark font-bold text-xs flex-shrink-0">
                      AR
                    </div>
                    <div>
                      <p className="text-xs text-white"><span className="font-semibold text-primary">Alex Rivera</span> viewed your profile</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex gap-3 hover:bg-white/5 p-2 rounded-lg transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      SJ
                    </div>
                    <div>
                      <p className="text-xs text-white"><span className="font-semibold text-blue-400">New match:</span> Sarah Jenkins (96 AI)</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex gap-3 hover:bg-white/5 p-2 rounded-lg transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      MZ
                    </div>
                    <div>
                      <p className="text-xs text-white"><span className="font-semibold text-purple-400">Message:</span> Michael Zhang replied</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-emerald-600 border border-border-dark flex items-center justify-center text-background-dark font-bold text-sm">
                {(user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleSignOut}
                className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/auth" className="text-slate-400 hover:text-primary text-sm font-medium transition-colors">
                Login
              </Link>
              <Link
                to="/auth?mode=signup"
                className="bg-primary text-background-dark px-5 py-2 rounded-xl font-bold text-sm hover:scale-105 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </header>
    </div>
  )
}
