// ─── AttackSimulator ──────────────────────────────────────────────────────────
// Ripple + flash + AI analysis toast after each simulated attack

import { useState } from 'react'
import { Zap, Sparkles } from 'lucide-react'
import { getAttackAnalysis } from '../services/aiService'

const ATTACKS = [
  { label: 'Simulate SQL Injection',  attackType: 'SQL Injection',         endpoint: '/login',    riskScore: 85, border: 'border-red-500/40',    activeBg: 'rgba(239,68,68,0.15)',   textColor: 'text-red-400',    flashColor: '#f87171' },
  { label: 'Simulate XSS Attack',     attackType: 'XSS Attack',            endpoint: '/api/data', riskScore: 72, border: 'border-amber-400/40',  activeBg: 'rgba(251,191,36,0.15)',  textColor: 'text-amber-400',  flashColor: '#fbbf24' },
  { label: 'Simulate Rate Abuse',     attackType: 'Rate Abuse',            endpoint: '/login',    riskScore: 65, border: 'border-orange-400/40', activeBg: 'rgba(251,146,60,0.15)',  textColor: 'text-orange-400', flashColor: '#fb923c' },
  { label: 'Simulate Unauth Access',  attackType: 'Unauthorized Access',   endpoint: '/admin',    riskScore: 91, border: 'border-red-500/40',    activeBg: 'rgba(239,68,68,0.15)',   textColor: 'text-red-400',    flashColor: '#f87171' },
  { label: 'Simulate Payload Attack', attackType: 'Payload Manipulation',  endpoint: '/payment',  riskScore: 78, border: 'border-amber-400/40',  activeBg: 'rgba(251,191,36,0.15)',  textColor: 'text-amber-400',  flashColor: '#fbbf24' },
]

function SimButton({ atk, onAnalysis }) {
  const [state, setState] = useState('idle') // idle | firing | done

  const handleClick = async () => {
    if (state !== 'idle') return
    setState('firing')

    // Kick off AI analysis in parallel — don't block the button UI
    getAttackAnalysis(atk.attackType, atk.endpoint, atk.riskScore)
      .then(text => onAnalysis(atk.attackType, text))
      .catch(() => onAnalysis(atk.attackType, null))

    setTimeout(() => setState('done'), 900)
    setTimeout(() => setState('idle'), 2400)
  }

  const isFiring = state === 'firing'
  const isDone   = state === 'done'

  return (
    <button
      onClick={handleClick}
      className={`btn-ripple relative border ${atk.border} ${atk.textColor}
                  rounded-lg px-3 py-2.5 text-[10px] font-semibold tracking-[0.12em]
                  uppercase transition-all duration-200 text-left select-none
                  ${isFiring ? 'scale-95' : 'hover:scale-[1.02]'}`}
      style={{
        background:  isFiring || isDone ? atk.activeBg : 'transparent',
        borderColor: isFiring || isDone ? atk.flashColor : undefined,
        boxShadow:   isFiring ? `0 0 16px ${atk.flashColor}44`
                   : isDone   ? `0 0 8px  ${atk.flashColor}22`
                   : undefined,
        transition: 'all 0.2s ease',
      }}
    >
      {isFiring && (
        <span className="absolute inset-0 rounded-lg pointer-events-none"
              style={{ background: `radial-gradient(circle at center, ${atk.flashColor}22 0%, transparent 70%)` }} />
      )}
      <span className="relative z-10">
        {isFiring ? '▶ Firing…' : isDone ? '✓ Attack Simulated' : atk.label}
      </span>
    </button>
  )
}

export default function AttackSimulator() {
  // toast: { type, text } | null
  const [toast, setToast] = useState(null)
  const [toastLoading, setToastLoading] = useState(false)

  const handleAnalysis = (attackType, text) => {
    setToastLoading(false)
    setToast({ attackType, text })
    // Auto-dismiss after 12 s
    setTimeout(() => setToast(null), 12000)
  }

  const handleFire = (atk) => {
    setToast(null)
    setToastLoading(true)
  }

  return (
    <div className="glass-card p-6 relative overflow-hidden">
      {/* Blob accent */}
      <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full blur-3xl pointer-events-none"
           style={{ background: 'rgba(239,68,68,0.08)' }} />

      {/* Header + badge */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-white/60">
          Demo Controls
        </h2>
        <div className="flex items-center gap-1 border border-white/10 rounded-full px-2 py-0.5 bg-white/[0.03]">
          <Zap size={9} className="text-white/40" />
          <span className="text-[9px] font-semibold tracking-wider uppercase text-white/40">
            For Demo Only
          </span>
        </div>
      </div>

      {/* 2-column button grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {ATTACKS.map(atk => (
          <SimButton
            key={atk.label}
            atk={atk}
            onAnalysis={handleAnalysis}
            onFire={() => handleFire(atk)}
          />
        ))}
      </div>

      {/* AI analysis toast — slides in below buttons */}
      {(toastLoading || toast) && (
        <div
          className="mt-4 rounded-xl border border-purple-500/20 bg-purple-500/[0.06] p-3 anim-enter delay-0"
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles size={9} className="text-purple-400" />
            <span className="text-[9px] font-semibold tracking-wider uppercase text-purple-400">
              AI Analysis{toast ? ` — ${toast.attackType}` : ''}
            </span>
          </div>
          {toastLoading ? (
            <p className="text-[10px] text-white/40 italic">Analysing attack with Grok AI…</p>
          ) : toast?.text ? (
            <p className="text-[10px] text-white/65 leading-relaxed">{toast.text}</p>
          ) : (
            <p className="text-[10px] text-amber-400/60 italic">
              ⚠ AI server offline — start the AI server for live analysis.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
