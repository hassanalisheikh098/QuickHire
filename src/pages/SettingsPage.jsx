import { useState } from 'react'
import Sidebar from '../components/layout/Sidebar'

export default function SettingsPage() {
  const [profilePublic, setProfilePublic] = useState(true)
  const [allowContact, setAllowContact] = useState(true)

  const [emailAlerts, setEmailAlerts] = useState(true)
  const [pushAlerts, setPushAlerts] = useState(false)
  const [weeklyDigest, setWeeklyDigest] = useState(true)

  const [autoRenew, setAutoRenew] = useState(true)
  const [shareUsage, setShareUsage] = useState(false)

  const ToggleRow = ({ label, desc, state, setState }) => (
    <div className="flex items-center justify-between py-4 border-b border-border-dark last:border-b-0">
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => setState(!state)}
        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none flex-shrink-0 ${
          state ? 'bg-primary' : 'bg-border-dark'
        }`}
      >
        <div
          className={`bg-background-dark w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
            state ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )

  return (
    <div className="bg-background-dark min-h-screen text-slate-100 flex">
      <Sidebar active="settings" />
      <div className="flex-1 overflow-y-auto">
        <header className="border-b border-border-dark px-8 py-5 flex items-center bg-background-dark/80 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h1 className="text-xl font-bold text-white">Settings</h1>
            <p className="text-slate-500 text-sm">Manage your profile, preferences, and billing</p>
          </div>
        </header>

        <main className="px-8 py-8 space-y-8 max-w-4xl step-enter">
          {/* Profile Settings */}
          <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-border-dark pb-3">
              <span className="material-symbols-outlined text-primary text-xl">person</span>
              <h2 className="text-base font-bold text-white">Profile Settings</h2>
            </div>
            <div className="divide-y divide-border-dark">
              <ToggleRow
                label="Public Profile Visibility"
                desc="Allow your recruiter profile to be visible to verified candidates"
                state={profilePublic}
                setState={setProfilePublic}
              />
              <ToggleRow
                label="Accept Inbound Inquiries"
                desc="Let matching candidates message you directly"
                state={allowContact}
                setState={setAllowContact}
              />
            </div>
          </div>

          {/* Notifications Settings */}
          <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-border-dark pb-3">
              <span className="material-symbols-outlined text-primary text-xl">notifications</span>
              <h2 className="text-base font-bold text-white">Notification Preferences</h2>
            </div>
            <div className="divide-y divide-border-dark">
              <ToggleRow
                label="Email Notifications"
                desc="Receive candidate matches and messages via email"
                state={emailAlerts}
                setState={setEmailAlerts}
              />
              <ToggleRow
                label="Push Notifications"
                desc="Receive desktop notifications for real-time matches"
                state={pushAlerts}
                setState={setPushAlerts}
              />
              <ToggleRow
                label="Weekly Performance Digest"
                desc="A summary of search analytics and pipeline health"
                state={weeklyDigest}
                setState={setWeeklyDigest}
              />
            </div>
          </div>

          {/* Billing & System Settings */}
          <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-border-dark pb-3">
              <span className="material-symbols-outlined text-primary text-xl">credit_card</span>
              <h2 className="text-base font-bold text-white">Billing & Systems</h2>
            </div>
            <div className="divide-y divide-border-dark">
              <ToggleRow
                label="Auto-Renew Plan"
                desc="Automatically renew subscription on the 15th of each month"
                state={autoRenew}
                setState={setAutoRenew}
              />
              <ToggleRow
                label="Share Usage Metrics"
                desc="Help improve AI match models by sharing anonymized search logs"
                state={shareUsage}
                setState={setShareUsage}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
