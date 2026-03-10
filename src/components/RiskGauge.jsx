// ─── RiskGauge ────────────────────────────────────────────────────────────────
// Needle sweeps LOW → MEDIUM + amber glow + AI recommendation panel

import { useState } from 'react'
import { ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts'
import { Sparkles } from 'lucide-react'
import { getRiskRecommendation } from '../services/aiService'

const ZONES = [
  { name: 'LOW',    value: 33, fill: '#2dd4bf' },
  { name: 'MEDIUM', value: 33, fill: '#fbbf24' },
  { name: 'HIGH',   value: 34, fill: '#f87171' },
]

const NEEDLE_ANGLE = 90
const cx = 110, cy = 110, r = 72
const needleRad = ((180 - NEEDLE_ANGLE) * Math.PI) / 180
const nx = cx + r * Math.cos(needleRad)
const ny = cy - r * Math.sin(needleRad)

export default function RiskGauge({ stats, endpoints }) {
  const [recommendation, setRecommendation] = useState(null)
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState(false)

  const fetchRecommendation = async () => {
    if (loading) return
    setLoading(true)
    setError(false)
    try {
      const text = await getRiskRecommendation('MEDIUM', stats, endpoints)
      setRecommendation(text)
    } catch {
      setError(true)
      setRecommendation(
        'Increase login endpoint rate-limiting to 5 requests/min and enable geo-blocking for admin routes. Review and rotate API keys for all endpoints flagged as CRITICAL or HIGH risk.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card p-6 flex flex-col items-center relative overflow-hidden">
      {/* Amber blob */}
      <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full blur-3xl pointer-events-none"
           style={{ background: 'rgba(251,191,36,0.15)' }} />

      <h2 className="w-full text-xs font-semibold tracking-[0.2em] uppercase text-white/60 mb-4">
        Current Threat Status
      </h2>

      {/* Gauge */}
      <div className="relative" style={{ width: 220, height: 130 }}>
        <ResponsiveContainer width={220} height={130}>
          <RadialBarChart
            cx="50%" cy="85%"
            innerRadius={55} outerRadius={90}
            startAngle={180} endAngle={0}
            data={ZONES} barSize={16}
          >
            <RadialBar dataKey="value" background={false}
              isAnimationActive={true} animationBegin={300} animationDuration={1000} />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* SVG needle */}
        <svg className="absolute inset-0 pointer-events-none" width={220} height={130} viewBox="0 0 220 130">
          <defs>
            <filter id="needleShadow">
              <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="rgba(255,255,255,0.3)" />
            </filter>
          </defs>
          <g className="needle-group">
            <line x1={cx} y1={cy + 10} x2={nx} y2={ny}
              stroke="white" strokeWidth={2} strokeLinecap="round" filter="url(#needleShadow)" />
          </g>
          <circle cx={cx} cy={cy + 10} r={5} fill="white"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6))' }} />
          <circle cx={cx} cy={cy + 10} r={2} fill="#000" />
        </svg>
      </div>

      {/* Zone labels */}
      <div className="flex justify-between w-[200px] -mt-2 mb-2">
        <span className="text-[9px] uppercase tracking-widest text-teal-400 font-semibold">Low</span>
        <span className="text-[9px] uppercase tracking-widest text-amber-400 font-semibold">Medium</span>
        <span className="text-[9px] uppercase tracking-widest text-red-400 font-semibold">High</span>
      </div>

      {/* Current level */}
      <span className="amber-glow text-sm font-bold tracking-[0.25em] uppercase text-amber-400 mt-1 mb-4">
        MEDIUM
      </span>

      {/* AI recommendation button */}
      <button
        onClick={fetchRecommendation}
        disabled={loading}
        className="w-full flex items-center justify-center gap-1.5 border border-purple-500/30
                   hover:border-purple-500/50 rounded-lg py-2 text-[10px] font-semibold
                   tracking-[0.15em] uppercase text-purple-400/70 hover:text-purple-300
                   bg-purple-500/[0.05] hover:bg-purple-500/10 transition-all
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Sparkles size={9} className={loading ? 'spin' : ''} />
        {loading ? 'Consulting Grok AI…' : 'Get AI Recommendation'}
      </button>

      {/* Recommendation panel */}
      {recommendation && (
        <div className="w-full mt-3 rounded-xl border border-purple-500/20 bg-purple-500/[0.05] p-3 anim-enter delay-0">
          {error && (
            <span className="block text-[9px] text-amber-400/60 mb-1">
              ⚠ AI server offline — showing fallback
            </span>
          )}
          <p className="text-[10px] text-white/65 leading-relaxed">{recommendation}</p>
        </div>
      )}
    </div>
  )
}
