// ─── MetricCards ─────────────────────────────────────────────────────────────
// Count-up + blob float + hover lift + AI micro-insight below each number

import { useEffect, useState } from 'react'
import { getCardInsights } from '../services/aiService'

const CARD_META = [
  { label: 'TOTAL REQUESTS',   key: 'totalRequests', suffix: '',     sub: 'REQUESTS RECEIVED', blurClr: 'rgba(45,212,191,0.18)',  delay: 200, insightKey: 'totalRequests' },
  { label: 'BLOCKED REQUESTS', key: 'blocked',       suffix: '',     sub: 'MALICIOUS BLOCKED', blurClr: 'rgba(239,68,68,0.18)',   delay: 300, insightKey: 'blocked'       },
  { label: 'SUSPICIOUS',       key: 'suspicious',    suffix: '',     sub: 'FLAGGED FOR REVIEW',blurClr: 'rgba(251,191,36,0.18)',  delay: 400, insightKey: 'suspicious'    },
  { label: 'ALLOWED',          key: 'allowed',       suffix: '',     sub: 'NORMAL TRAFFIC',    blurClr: 'rgba(74,222,128,0.18)',  delay: 500, insightKey: 'allowed'       },
  { label: 'SECURITY SCORE',   key: 'securityScore', suffix: '/100', sub: 'STABLE',            blurClr: 'rgba(96,165,250,0.18)',  delay: 600, insightKey: 'score'         },
]

// Count-up hook: 0 → target with ease-out cubic
function useCountUp(target, duration = 1500, startDelay = 0) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let raf, start = null
    const step = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    const t = setTimeout(() => { raf = requestAnimationFrame(step) }, startDelay)
    return () => { clearTimeout(t); cancelAnimationFrame(raf) }
  }, [target, duration, startDelay])
  return count
}

function StatCard({ card, insight }) {
  const animated = useCountUp(card.numVal, 1500, card.delay + 300)

  return (
    <div
      className="glass-card metric-card relative overflow-hidden p-5 flex flex-col gap-3 min-h-[130px] anim-enter"
      style={{ animationDelay: `${card.delay}ms` }}
    >
      {/* Floating colour blob */}
      <div
        className="blob-float absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl pointer-events-none"
        style={{ background: card.blurClr }}
      />

      {/* Label */}
      <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/40 relative z-10">
        {card.label}
      </span>

      {/* Animated number */}
      <span className="text-4xl font-bold text-white leading-none relative z-10 tabular-nums">
        {animated}{card.suffix}
      </span>

      {/* AI micro-insight */}
      {insight ? (
        <span className="text-[10px] text-purple-300/70 leading-snug relative z-10 italic">
          {insight}
        </span>
      ) : (
        <span className="text-[10px] tracking-[0.14em] uppercase text-white/30 mt-auto relative z-10">
          {card.sub}
        </span>
      )}
    </div>
  )
}

export default function MetricCards({ stats }) {
  const [insights, setInsights] = useState(null)

  // Fetch AI insights once on mount
  useEffect(() => {
    getCardInsights(stats)
      .then(data => setInsights(data))
      .catch(() => {}) // silently fall back to static sub-labels
  }, [])

  const cards = CARD_META.map(meta => ({ ...meta, numVal: stats[meta.key] }))

  return (
    <div className="grid grid-cols-5 gap-4">
      {cards.map(card => (
        <StatCard
          key={card.label}
          card={card}
          insight={insights?.[card.insightKey] ?? null}
        />
      ))}
    </div>
  )
}
