// ─── AIThreatSummary ──────────────────────────────────────────────────────────
// Fetches live threat summary from AI server on mount + regenerate click.
// Falls back gracefully if AI server is unavailable.

import { useState, useEffect, useRef } from 'react'
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react'
import { threatSummary } from '../data/mockData'
import { getThreatSummary } from '../services/aiService'

const INDICATOR_STYLE = {
  ACTIVE:     'bg-red-500/20 text-red-400 border border-red-500/30',
  BLOCKED:    'bg-green-500/10 text-green-400/80 border border-green-500/20',
  MONITORING: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
}
const SHOULD_PULSE = { ACTIVE: true, MONITORING: true, BLOCKED: false }

// Typewriter hook: reveals characters progressively
function useTypewriter(text, speed = 16, startDelay = 300) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone]           = useState(false)
  const raf = useRef(null)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0, last = 0

    const tick = (ts) => {
      if (!last) last = ts
      if (ts - last >= speed) {
        i++
        setDisplayed(text.slice(0, i))
        last = ts
        if (i >= text.length) { setDone(true); return }
      }
      raf.current = requestAnimationFrame(tick)
    }

    const timeout = setTimeout(() => { raf.current = requestAnimationFrame(tick) }, startDelay)
    return () => { clearTimeout(timeout); cancelAnimationFrame(raf.current) }
  }, [text, speed, startDelay])

  return { displayed, done }
}

export default function AIThreatSummary({ stats, attackTypes, endpoints }) {
  const [summaryText, setSummaryText] = useState("Analyzing threat patterns...")
  const [loading, setLoading]         = useState(false)
  const { displayed, done } = useTypewriter(summaryText, 16, 800)

  const generateSummary = async () => {
    setLoading(true)
    const result = await getThreatSummary(stats, attackTypes, endpoints)
    setSummaryText(result)
    setLoading(false)
  }

  // Fetch on mount
  useEffect(() => { generateSummary() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden">
      {/* Purple blob */}
      <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full blur-3xl pointer-events-none"
           style={{ background: 'rgba(168,85,247,0.1)' }} />

      {/* Header + AI badge */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-white/60">
          AI Threat Summary
        </h2>
        <div className="flex items-center gap-1 border border-purple-500/30 rounded-full px-2 py-0.5 bg-purple-500/10">
          <Sparkles size={9} className="text-purple-400" />
          <span className="text-[9px] font-semibold tracking-wider uppercase text-purple-400">
            AI Powered
          </span>
        </div>
      </div>

      {/* Typewriter text */}
      <p
        className="text-xs leading-relaxed transition-opacity duration-300 min-h-[80px]"
        style={{ color: 'rgba(255,255,255,0.6)', opacity: loading ? 0.2 : 1 }}
      >
        {loading ? (
          <span className="flex items-center gap-1.5 text-white/30 italic">
            <Loader2 size={10} className="spin" />
            Analysing with Grok AI…
          </span>
        ) : (
          <>
            {displayed}
            {!done && (
              <span className="inline-block w-[6px] h-[12px] bg-white/50 ml-0.5 align-middle"
                    style={{ animation: 'cursorBlink 1.1s step-end infinite' }} />
            )}
          </>
        )}
      </p>

      {/* Threat indicators */}
      <div className="flex flex-col gap-2">
        <span className="text-[9px] font-semibold tracking-[0.18em] uppercase text-white/30">
          Active Indicators
        </span>
        {threatSummary.indicators.map(ind => (
          <div key={ind.name} className="flex items-center justify-between">
            <span className="text-xs text-white/60">{ind.name}</span>
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase
                              ${INDICATOR_STYLE[ind.status]}
                              ${SHOULD_PULSE[ind.status] ? 'badge-active' : ''}`}>
              {ind.status}
            </span>
          </div>
        ))}
      </div>

      {/* Last updated */}
      <p className="text-[10px] text-white/25 tracking-wide">
        Last updated: {threatSummary.lastUpdated}
      </p>

      {/* Regenerate button */}
      <button
        onClick={generateSummary}
        disabled={loading}
        className="w-full border border-white/10 hover:border-white/20 rounded-lg py-2
                   text-[10px] font-semibold tracking-[0.18em] uppercase text-white/50
                   hover:text-white/80 transition-all bg-white/[0.02] hover:bg-white/[0.05]
                   disabled:opacity-40 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
      >
        {loading
          ? <Loader2 size={10} className="spin" />
          : <RefreshCw size={10} />
        }
        {loading ? 'Analysing…' : 'Regenerate'}
      </button>
    </div>
  )
}
