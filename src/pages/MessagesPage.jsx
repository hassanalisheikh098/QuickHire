import Sidebar from '../components/layout/Sidebar'
import { useToast } from '../context/ToastContext'

export default function MessagesPage() {
  const { showToast } = useToast()

  const handleNotify = () => {
    showToast("We'll let you know!")
  }

  return (
    <div className="bg-background-dark min-h-screen text-slate-100 flex">
      <Sidebar active="messages" />
      <div className="flex-1 overflow-y-auto">
        <header className="border-b border-border-dark px-8 py-5 flex items-center bg-background-dark/80 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h1 className="text-xl font-bold text-white">Messages</h1>
            <p className="text-slate-500 text-sm">Direct candidate communication portal</p>
          </div>
        </header>

        <main className="px-8 py-8 flex flex-col items-center justify-center min-h-[70vh] max-w-7xl mx-auto">
          <div className="bg-card-dark border border-border-dark rounded-2xl p-12 text-center max-w-md shadow-2xl relative overflow-hidden group step-enter">
            <div className="absolute inset-0 mesh-gradient opacity-10" />
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-3xl">chat_bubble</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Direct Messaging</h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Direct messaging with candidates is coming in the next release. Receive instant alerts when top talent replies.
            </p>
            <button
              onClick={handleNotify}
              className="w-full bg-primary text-background-dark py-3 rounded-xl font-bold text-sm hover:scale-[1.02] transition-all button-glow"
            >
              Notify me
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
