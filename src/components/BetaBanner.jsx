import React, { useState, useEffect } from 'react'

export default function BetaBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [timeLeft, setTimeLeft] = useState(null)

  // Target time: July 1, 2026 at 00:00 PKT (UTC+5)
  // equivalent to 2026-07-01T00:00:00+05:00
  const targetTime = new Date('2026-07-01T00:00:00+05:00').getTime()

  useEffect(() => {
    if (!isVisible) return

    const updateCountdown = () => {
      const now = new Date().getTime()
      const difference = targetTime - now

      if (difference <= 0) {
        setIsVisible(false)
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [isVisible, targetTime])

  const handleDismiss = () => {
    setIsVisible(false)
  }

  if (!isVisible || !timeLeft) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-md bg-card-dark border border-border-dark rounded-2xl shadow-2xl p-5 step-enter">
      {/* Dismiss Button */}
      <button 
        onClick={handleDismiss} 
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-200 transition-colors"
        aria-label="Dismiss banner"
      >
        <span className="material-symbols-outlined text-lg">close</span>
      </button>

      <div className="flex flex-col items-center gap-3">
        {/* Label Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
          PUBLIC BETA
        </div>

        {/* Text Details */}
        <div className="space-y-1 text-center">
          <h4 className="text-sm font-semibold text-slate-200 leading-snug">
            QuickHire is free until 1st July 2026
          </h4>
          <p className="text-xs text-text-muted leading-relaxed">
            Pricing begins once the candidate bank hits 500 profiles
          </p>
        </div>

        {/* Countdown Digits */}
        <div className="text-sm text-slate-300 font-medium">
          <span className="font-mono text-primary text-base font-bold">{timeLeft.days}</span>d{' '}
          <span className="font-mono text-primary text-base font-bold">{timeLeft.hours}</span>h{' '}
          <span className="font-mono text-primary text-base font-bold">{timeLeft.minutes}</span>m{' '}
          <span className="font-mono text-primary text-base font-bold">{timeLeft.seconds}</span>s
        </div>
      </div>
    </div>
  )
}
