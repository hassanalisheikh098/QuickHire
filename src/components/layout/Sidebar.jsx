import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const recruiterNavItems = [
  { to: '/dashboard', icon: 'bookmark', label: 'Saved Candidates', key: 'saved' },
  { to: '/search', icon: 'manage_search', label: 'AI Search', key: 'search' },
  { to: '/candidates', icon: 'group', label: 'Browse Talent', key: 'browse' },
  { to: '/messages', icon: 'chat_bubble', label: 'Messages', key: 'messages', badge: '12' },
  { to: '/settings', icon: 'settings', label: 'Settings', key: 'settings' },
]

const candidateNavItems = [
  { to: '/dashboard', icon: 'dashboard', label: 'My Dashboard', key: 'saved' },
  { to: '/onboarding', icon: 'upload_file', label: 'Update Resume', key: 'onboarding' },
  { to: '/messages', icon: 'chat_bubble', label: 'Messages', key: 'messages' },
  { to: '/settings', icon: 'settings', label: 'Settings', key: 'settings' },
]

export default function Sidebar({ active, isOpen, onClose }) {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const userRole = user?.user_metadata?.role || null

  const neutralNavItems = [
    { to: '/messages', icon: 'chat_bubble', label: 'Messages', key: 'messages' },
    { to: '/settings', icon: 'settings', label: 'Settings', key: 'settings' },
  ]

  const navItems = userRole === 'candidate'
    ? candidateNavItems
    : userRole === 'recruiter'
      ? recruiterNavItems
      : neutralNavItems

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar-dark border-r border-border-dark flex flex-col h-full transform transition-transform duration-300 lg:static lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-background-dark font-black text-sm leading-none">Q</span>
              </div>
              <div>
                <div className="flex items-center gap-0.5">
                  <span className="text-base font-black tracking-tight text-white">Quick</span>
                  <span className="text-base font-black tracking-tight text-primary">Hire</span>
                </div>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">
                  {userRole === 'candidate' ? 'Talent Space' : userRole === 'recruiter' ? 'AI Discovery' : 'QuickHire'}
                </p>
              </div>
            </Link>
            <button 
              onClick={onClose}
              className="lg:hidden text-slate-500 hover:text-white flex items-center justify-center p-1"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                active === item.key
                  ? 'bg-primary/10 text-primary border-l-4 border-primary'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className={`text-sm ${active === item.key ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-border-dark">
        {userRole !== 'candidate' && (
          <div className="bg-card-dark/50 rounded-xl p-4 border border-border-dark mb-4">
            <p className="text-xs text-slate-500 font-medium mb-1">Current Plan</p>
            <p className="text-sm text-white font-bold mb-3">Enterprise Pro</p>
            <div className="w-full bg-border-dark h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-3/4"></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">750 / 1000 searches left</p>
          </div>
        )}

        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-emerald-600 flex items-center justify-center text-background-dark font-bold text-sm flex-shrink-0">
                {(user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="truncate flex flex-col">
                <span className="text-white text-xs font-bold truncate">{user.user_metadata?.full_name || 'QuickHire User'}</span>
                <span className="text-slate-500 text-[10px] truncate">{user.email}</span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-border-dark text-slate-400 hover:text-white rounded-xl text-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Sign out
            </button>
          </div>
        ) : (
          <Link
            to="/auth?mode=signup"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-background-dark rounded-xl font-bold text-sm hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Get Started
          </Link>
        )}
      </div>
    </aside>
    </>
  )
}
