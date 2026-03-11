// ─── AttackSimulator ──────────────────────────────────────────────────────────
// 5 attack simulation buttons + premium AI analysis toast (8s, CSS transition)

import { useState, useEffect, useRef } from 'react'
import { Zap, Loader2, RotateCcw } from 'lucide-react'
import { getAttackAnalysis } from '../services/aiService'
import {
  triggerSQLInjection,
  triggerXSS,
  triggerRateAbuse,
  triggerUnauthAccess,
  triggerPayloadAttack,
  triggerGoodRequest,
  resetDashboard
} from '../services/backendService'

// ── Attack config ─────────────────────────────────────────────────────────────
const ATTACKS = [
  {
    label:       'SIMULATE SQL INJECTION',
    trigger:     triggerSQLInjection,
    type:        'SQL Injection',
    endpoint:    '/login',
    riskScore:   92,
    border:      'border-red-500/40',
    activeBg:    'rgba(239,68,68,0.15)',
    textColor:   'text-red-400',
    flashColor:  '#f87171',
    badgeBg:     'rgba(255,50,50,0.15)',
    badgeBorder: 'rgba(255,50,50,0.3)',
    badgeColor:  '#ff6b6b',
  },
  {
    label:       'SIMULATE XSS ATTACK',
    trigger:     triggerXSS,
    type:        'XSS Attack',
    endpoint:    '/profile',
    riskScore:   78,
    border:      'border-amber-400/40',
    activeBg:    'rgba(251,191,36,0.15)',
    textColor:   'text-amber-400',
    flashColor:  '#fbbf24',
    badgeBg:     'rgba(251,191,36,0.15)',
    badgeBorder: 'rgba(251,191,36,0.3)',
    badgeColor:  '#fbbf24',
  },
  {
    label:       'SIMULATE RATE ABUSE',
    trigger:     triggerRateAbuse,
    type:        'Rate Abuse',
    endpoint:    '/api/data',
    riskScore:   71,
    border:      'border-orange-400/40',
    activeBg:    'rgba(251,146,60,0.15)',
    textColor:   'text-orange-400',
    flashColor:  '#fb923c',
    badgeBg:     'rgba(251,146,60,0.15)',
    badgeBorder: 'rgba(251,146,60,0.3)',
    badgeColor:  '#fb923c',
  },
  {
    label:       'SIMULATE UNAUTH ACCESS',
    trigger:     triggerUnauthAccess,
    type:        'Unauthorized Access',
    endpoint:    '/admin',
    riskScore:   95,
    border:      'border-red-500/40',
    activeBg:    'rgba(239,68,68,0.15)',
    textColor:   'text-red-400',
    flashColor:  '#f87171',
    badgeBg:     'rgba(255,50,50,0.15)',
    badgeBorder: 'rgba(255,50,50,0.3)',
    badgeColor:  '#ff6b6b',
  },
  {
    label:       'SIMULATE PAYLOAD ATTACK',
    trigger:     triggerPayloadAttack,
    type:        'Payload Manipulation',
    endpoint:    '/payment',
    riskScore:   88,
    border:      'border-amber-400/40',
    activeBg:    'rgba(251,191,36,0.15)',
    textColor:   'text-amber-400',
    flashColor:  '#fbbf24',
    badgeBg:     'rgba(251,191,36,0.15)',
    badgeBorder: 'rgba(251,191,36,0.3)',
    badgeColor:  '#fbbf24',
  },
]

const GOOD_REQUEST = {
  label:       'SEND GOOD REQUEST',
  trigger:     triggerGoodRequest,
  type:        'Legitimate Traffic',
  endpoint:    '/api/public',
  riskScore:   5,
  border:      'border-emerald-500/40',
  activeBg:    'rgba(16,185,129,0.15)',
  textColor:   'text-emerald-400',
  flashColor:  '#10b981',
  badgeBg:     'rgba(16,185,129,0.15)',
  badgeBorder: 'rgba(16,185,129,0.3)',
  badgeColor:  '#10b981',
}

// ── SimButton ─────────────────────────────────────────────────────────────────
function SimButton({ atk, onAttack }) {
  const [state, setState] = useState('idle')

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

// ── Premium AI Toast ──────────────────────────────────────────────────────────
function AIToast({ toast, toastVisible, progressKey, onDismiss }) {
  if (!toast) return null

  return (
    <div
      style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 50, width: 380,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 16, padding: '20px 24px',
        boxShadow: '0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
        opacity:    toastVisible ? 1 : 0,
        transform:  toastVisible ? 'translateX(0)' : 'translateX(calc(100% + 24px))',
        transition: 'opacity 400ms ease, transform 400ms ease',
        pointerEvents: toastVisible ? 'auto' : 'none',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Pulsing dot */}
          <span style={{ position: 'relative', display: 'inline-flex', width: 6, height: 6 }}>
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#00ff88', opacity: 0.6, animation: 'livePulse 1.5s ease-in-out infinite' }} />
            <span style={{ position: 'relative', width: 6, height: 6, borderRadius: '50%', background: '#00ff88', display: 'inline-block' }} />
          </span>
          <span style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 11, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
            AI Analysis
          </span>
          <span style={{ background: toast.atk.badgeBg, border: `1px solid ${toast.atk.badgeBorder}`, color: toast.atk.badgeColor, fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 10, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 4, letterSpacing: '0.05em' }}>
            {toast.atk.type}
          </span>
        </div>
        <button
          onClick={onDismiss}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: 14, lineHeight: 1, padding: '2px 4px', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
        >✕</button>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '12px 0' }} />

      {/* Body */}
      <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif', fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.75)', margin: 0 }}>
        {toast.body}
      </p>

      {/* Footer + progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
        <span style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
          🤖 Powered by Groq AI
        </span>
        <div style={{ width: 80, height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 1, overflow: 'hidden' }}>
          <div
            key={progressKey}
            className="toast-progress"
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #00ff88, #00aaff)',
              borderRadius: 1,
              animationDuration: '8s',
              animationPlayState: toastVisible ? 'running' : 'paused',
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AttackSimulator({ onRefresh }) {
  const [toast,        setToast]        = useState(null)
  const [toastVisible, setToastVisible] = useState(false)
  const [progressKey,  setProgressKey]  = useState(0)
  const toastTimerRef = useRef(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  function showToast(body, atk) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)

    setToast({ body, atk })
    setToastVisible(true)
    setProgressKey(k => k + 1)

    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false)
      setTimeout(() => setToast(null), 400)
    }, 8000)
  }

  function dismissToast() {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToastVisible(false)
    setTimeout(() => setToast(null), 400)
  }

  const handleAttack = async (atk) => {
    try { await atk.trigger() } catch { /* backend may be down */ }
    await new Promise(r => setTimeout(r, 1500))
    try { await onRefresh() } catch { /* silent */ }

    const analysis = await getAttackAnalysis(atk.type, atk.endpoint, atk.riskScore)
    showToast(analysis, atk)
  }

  const handleReset = async () => {
    try { 
      await resetDashboard() 
      await onRefresh()
    } catch { /* silent */ }
  }

  return (
    <>
      <div className="glass-card p-6 relative overflow-hidden">
        {/* Blob accent */}
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full blur-3xl pointer-events-none"
             style={{ background: 'rgba(239,68,68,0.08)' }} />

        {/* Header */}
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

        {/* Attack buttons — 2-column grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {ATTACKS.map(atk => (
            <SimButton key={atk.label} atk={atk} onAttack={handleAttack} />
          ))}
          <div className="col-span-2">
            <SimButton atk={GOOD_REQUEST} onAttack={handleAttack} />
          </div>
          <div className="col-span-2 mt-2">
            <button
              onClick={handleReset}
              className="w-full btn-ripple relative border border-rose-500/30 text-rose-400
                         rounded-lg px-3 py-2.5 text-[10px] font-semibold tracking-[0.12em]
                         uppercase transition-all duration-200 text-center select-none
                         hover:bg-rose-500/10 hover:border-rose-500/60
                         flex items-center justify-center gap-2"
            >
              <RotateCcw size={12} className="text-rose-400" />
              RESET FIREWALL MEMORY
            </button>
          </div>
        </div>
      </div>

      {/* Fixed-position premium toast */}
      <AIToast
        toast={toast}
        toastVisible={toastVisible}
        progressKey={progressKey}
        onDismiss={dismissToast}
      />
    </>
  )
}
