// ─── AttackSimulator ──────────────────────────────────────────────────────────
// Ripple + flash + fixed-position AI analysis toast (bottom-right)

import { useState } from 'react'
import { Zap, Loader2 } from 'lucide-react'
import { getAttackAnalysis } from '../services/aiService'
import {
  triggerSQLInjection,
  triggerXSS,
  triggerRateAbuse,
  triggerUnauthAccess,
  triggerPayloadAttack,
} from '../services/backendService'

const ATTACKS = [
  {
    label: 'SIMULATE SQL INJECTION',
    trigger: triggerSQLInjection,
    type: 'SQL Injection',
    endpoint: '/login',
    riskScore: 92,
    border: 'border-red-500/40',
    activeBg: 'rgba(239,68,68,0.15)',
    textColor: 'text-red-400',
    flashColor: '#f87171',
    color: 'red',
  },
  {
    label: 'SIMULATE XSS ATTACK',
    trigger: triggerXSS,
    type: 'XSS Attack',
    endpoint: '/profile',
    riskScore: 78,
    border: 'border-amber-400/40',
    activeBg: 'rgba(251,191,36,0.15)',
    textColor: 'text-amber-400',
    flashColor: '#fbbf24',
    color: 'amber',
  },
  {
    label: 'SIMULATE RATE ABUSE',
    trigger: triggerRateAbuse,
    type: 'Rate Abuse',
    endpoint: '/api/data',
    riskScore: 71,
    border: 'border-orange-400/40',
    activeBg: 'rgba(251,146,60,0.15)',
    textColor: 'text-orange-400',
    flashColor: '#fb923c',
    color: 'orange',
  },
  {
    label: 'SIMULATE UNAUTH ACCESS',
    trigger: triggerUnauthAccess,
    type: 'Unauthorized Access',
    endpoint: '/admin',
    riskScore: 95,
    border: 'border-red-500/40',
    activeBg: 'rgba(239,68,68,0.15)',
    textColor: 'text-red-400',
    flashColor: '#f87171',
    color: 'red',
  },
  {
    label: 'SIMULATE PAYLOAD ATTACK',
    trigger: triggerPayloadAttack,
    type: 'Payload Manipulation',
    endpoint: '/payment',
    riskScore: 88,
    border: 'border-amber-400/40',
    activeBg: 'rgba(251,191,36,0.15)',
    textColor: 'text-amber-400',
    flashColor: '#fbbf24',
    color: 'amber',
  },
]

const TOAST_BORDER = {
  red:    'border-red-500/30',
  amber:  'border-amber-500/30',
  orange: 'border-orange-500/30',
}
const TOAST_TITLE_COLOR = {
  red:    'text-red-400',
  amber:  'text-amber-400',
  orange: 'text-orange-400',
}

function SimButton({ atk, onAttack }) {
  const [state, setState] = useState('idle') // idle | firing | done

  const handleClick = async () => {
    if (state !== 'idle') return
    setState('firing')
    await onAttack(atk)
    setState('done')
    setTimeout(() => setState('idle'), 1500)
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
      <span className="relative z-10 flex items-center gap-1.5">
        {isFiring && <Loader2 size={9} className="spin shrink-0" />}
        {isFiring ? 'Firing…' : isDone ? '✓ Simulated' : atk.label}
      </span>
    </button>
  )
}

// Fixed-position AI analysis toast — slides in from bottom-right
function AIToast({ toast, onDismiss }) {
  if (!toast) return null
  const borderCls = TOAST_BORDER[toast.color]   || 'border-white/20'
  const titleCls  = TOAST_TITLE_COLOR[toast.color] || 'text-white'

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-80 anim-enter delay-0"
      style={{
        background: 'rgba(8,8,12,0.92)',
        border: `1px solid`,
        borderRadius: 14,
        padding: '14px 16px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}
    >
      <div className={`flex items-center justify-between mb-2 ${borderCls}`}
           style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8, marginBottom: 8 }}>
        <span className={`text-[10px] font-bold tracking-[0.18em] uppercase ${titleCls}`}>
          🤖 AI Analysis
        </span>
        <button
          onClick={onDismiss}
          className="text-white/30 hover:text-white/60 text-xs leading-none"
        >
          ✕
        </button>
      </div>
      <p className="text-[11px] text-white/65 leading-relaxed">{toast.body}</p>
    </div>
  )
}

export default function AttackSimulator({ onRefresh }) {
  const [toast, setToast] = useState(null)

  const handleAttack = async (atk) => {
    // 1. Trigger real backend attack
    try { await atk.trigger() } catch { /* backend may be down */ }

    // 2. Wait for firewall to process
    await new Promise(r => setTimeout(r, 1500))

    // 3. Refresh dashboard
    try { await onRefresh() } catch { /* silent */ }

    // 4. Get AI analysis + show toast
    const analysis = await getAttackAnalysis(atk.type, atk.endpoint, atk.riskScore)
    const newToast = { body: analysis, color: atk.color }
    setToast(newToast)

    // 5. Auto-dismiss after 6 s
    setTimeout(() => setToast(t => t === newToast ? null : t), 6000)
  }

  return (
    <>
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
              onAttack={handleAttack}
            />
          ))}
        </div>
      </div>

      {/* Fixed-position toast */}
      <AIToast toast={toast} onDismiss={() => setToast(null)} />
    </>
  )
}
