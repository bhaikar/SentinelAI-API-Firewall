// ─── Navbar ──────────────────────────────────────────────────────────────────
// Smooth-scroll nav + IntersectionObserver active highlighting

import { useState, useEffect } from 'react'
import { Shield } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', target: 'dashboard' },
  { label: 'Threats',   target: 'threats'   },
  { label: 'Endpoints', target: 'endpoints' },
  { label: 'Logs',      target: 'logs'      },
  { label: 'Settings',  target: 'settings'  },
]

export default function Navbar({ isLive }) {
  const [time, setTime]     = useState('')
  const [active, setActive] = useState('dashboard')

  // ── Live UTC clock ──────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toUTCString().split(' ').slice(4, 5)[0] + ' UTC')
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // ── IntersectionObserver — highlights active section on scroll ──────────────
  useEffect(() => {
    const observers = []

    NAV_ITEMS.forEach(({ target }) => {
      const el = document.getElementById(target)
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(target)
        },
        { threshold: 0.3 },
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach(o => o.disconnect())
  }, [])

  // ── Smooth scroll on click ──────────────────────────────────────────────────
  const handleNavClick = (target) => {
    const el = document.getElementById(target)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActive(target)
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-black border-b border-white/[0.06]">
      <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between gap-6">

        {/* ── Logo ── */}
        <div className="flex items-center gap-2 shrink-0">
          <Shield size={18} className="text-white" strokeWidth={2} />
          <span className="text-white font-bold tracking-[0.12em] text-sm uppercase">
            SentinelAI
          </span>
        </div>

        {/* ── Navigation links ── */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ label, target }) => (
            <li key={target}>
              <button
                onClick={() => handleNavClick(target)}
                className={`nav-link px-4 py-1.5 text-xs font-medium tracking-widest uppercase
                            transition-colors duration-200
                            ${active === target
                              ? 'nav-active text-white'
                              : 'text-white/40 hover:text-white/70'
                            }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        {/* ── Right: clock + firewall badge ── */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-white/40 text-xs font-mono tabular-nums transition-all duration-500">
            {time}
          </span>

          <div className="flex items-center gap-1.5 border border-white/10 rounded-full px-3 py-1 bg-white/[0.04]">
            <span className="relative flex h-2 w-2">
              <span className="glow-dot absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-green-400">
              Firewall Active
            </span>
          </div>

          {/* Live / Demo indicator */}
          {isLive ? (
            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-green-400">
              ● LIVE
            </span>
          ) : (
            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-white/30">
              ● DEMO
            </span>
          )}
        </div>

      </div>
    </nav>
  )
}
