// ─── RiskGauge ────────────────────────────────────────────────────────────────
// SVG semicircle gauge + animated needle + AI recommendation panel

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { getRiskRecommendation } from '../services/aiService'

// ── Gauge geometry ────────────────────────────────────────────────────────────
const CX = 100, CY = 100, R = 80, NL = 65   // center, radius, needle length

// Convert math angle (0°=right, 90°=up) to SVG screen coordinates
function pt(deg) {
  const r = (deg * Math.PI) / 180
  return { x: CX + R * Math.cos(r), y: CY - R * Math.sin(r) }
}

// Build SVG arc path between two math-convention angles
// sweep=1 → clockwise on screen (goes through the top half)
function arc(a1, a2) {
  const s  = pt(a1)
  const e  = pt(a2)
  const lg = Math.abs(a1 - a2) > 180 ? 1 : 0
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${R} ${R} 0 ${lg} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`
}

const ZONES = [
  { a1: 180, a2: 120, color: '#2dd4bf', label: 'Low'  },
  { a1: 120, a2:  60, color: '#fbbf24', label: 'Medium' },
  { a1:  60, a2:   0, color: '#f87171', label: 'High' },
]

// Needle CSS rotation (0° = pointing right; -90° = up = MEDIUM)
function getRisk(score) {
  if (score >= 70) return { level: 'LOW',    angle: -150, color: '#2dd4bf' }
  if (score >= 40) return { level: 'MEDIUM', angle:  -90, color: '#fbbf24' }
  return                  { level: 'HIGH',   angle:  -30, color: '#f87171' }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function RiskGauge({ stats, endpoints }) {
  const score = stats?.securityScore ?? 84
  const { level, angle, color } = getRisk(score)

  // Needle starts pointing up (MEDIUM), then sweeps to actual position
  const [needleAngle, setNeedleAngle] = useState(-90)
  const [rec,         setRec]         = useState(null)
  const [loadingRec,  setLoadingRec]  = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setNeedleAngle(angle), 200)
    return () => clearTimeout(t)
  }, [angle])

  async function handleGetRecommendation() {
    setLoadingRec(true)
    setRec(null)
    try {
      const result = await getRiskRecommendation(
        level,
        stats,
        endpoints?.length > 0 ? endpoints : [
          { path: '/login', blocked: 3 },
          { path: '/admin', blocked: 5 },
        ]
      )
      setRec(result)
    } catch {
      setRec('Unable to get AI recommendation.')
    }
    setLoadingRec(false)
  }

  return (
    <div className="glass-card p-6 flex flex-col items-center relative overflow-hidden">
      {/* Blob accent */}
      <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full blur-3xl pointer-events-none"
           style={{ background: 'rgba(251,191,36,0.15)' }} />

      <h2 className="w-full text-xs font-semibold tracking-[0.2em] uppercase text-white/60 mb-4">
        Current Threat Status
      </h2>

      {/* ── SVG Gauge ── */}
      <svg
        viewBox="0 0 200 110"
        width="200"
        height="110"
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* Background track */}
        <path
          d={arc(180, 0)}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={18}
          strokeLinecap="butt"
        />

        {/* Coloured zone arcs */}
        {ZONES.map(z => (
          <path
            key={z.label}
            d={arc(z.a1, z.a2)}
            fill="none"
            stroke={z.color}
            strokeWidth={18}
            strokeLinecap="butt"
            opacity={0.9}
          />
        ))}

        {/* Needle — drawn pointing right, CSS-rotated around pivot */}
        <g style={{
          transform:       `rotate(${needleAngle}deg)`,
          transformOrigin: `${CX}px ${CY}px`,
          transformBox:    'view-box',
          transition:      'transform 1s ease-in-out',
        }}>
          {/* Glow behind needle */}
          <line
            x1={CX} y1={CY} x2={CX + NL} y2={CY}
            stroke="rgba(255,255,255,0.15)" strokeWidth={6} strokeLinecap="round"
          />
          {/* Needle line */}
          <line
            x1={CX} y1={CY} x2={CX + NL} y2={CY}
            stroke="white" strokeWidth={2} strokeLinecap="round"
          />
        </g>

        {/* Pivot circle */}
        <circle cx={CX} cy={CY} r={5} fill="white"
                style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6))' }} />
        <circle cx={CX} cy={CY} r={2} fill="#000" />
      </svg>

      {/* Zone labels */}
      <div className="flex justify-between w-[180px] mt-1 mb-2">
        <span className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: '#2dd4bf' }}>Low</span>
        <span className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: '#fbbf24' }}>Medium</span>
        <span className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: '#f87171' }}>High</span>
      </div>

      {/* Current level badge */}
      <span
        className="text-sm font-bold tracking-[0.25em] uppercase mt-1 mb-4"
        style={{ color }}
      >
        {level}
      </span>

      {/* AI recommendation button */}
      <button
        onClick={handleGetRecommendation}
        disabled={loadingRec}
        className="w-full flex items-center justify-center gap-2 rounded-lg transition-all duration-200
                   disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background:    'transparent',
          border:        '1px solid rgba(255,255,255,0.12)',
          color:         loadingRec ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.6)',
          fontFamily:    "'SF Mono', 'Fira Code', monospace",
          fontSize:      11,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          padding:       '10px',
        }}
        onMouseEnter={e => {
          if (!loadingRec) {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
            e.currentTarget.style.color = '#ffffff'
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
          e.currentTarget.style.color = loadingRec ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.6)'
        }}
      >
        {loadingRec && <Loader2 size={10} className="spin" />}
        {loadingRec ? 'Consulting Grok AI…' : 'Get AI Recommendation'}
      </button>

      {/* Recommendation panel */}
      {rec && (
        <div
          className="w-full rec-panel-enter"
          style={{
            marginTop:    10,
            background:   'rgba(255,255,255,0.03)',
            border:       '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding:      '14px 16px',
          }}
        >
          <p style={{
            fontFamily:    "'SF Mono', 'Fira Code', monospace",
            fontSize:      10,
            color:         'rgba(255,255,255,0.3)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom:  8,
          }}>
            🤖 AI Recommendation
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: 0 }}>
            {rec}
          </p>
        </div>
      )}
    </div>
  )
}
