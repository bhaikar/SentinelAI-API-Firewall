// ─── RequestActivityChart ─────────────────────────────────────────────────────
// Area fills with gradient + animated draw-in + glass tooltip

import { useState } from 'react'
import {
  ResponsiveContainer, ComposedChart, Area, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'

// Premium dark glass tooltip
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: 'rgba(10,10,15,0.92)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 12,
        padding: '10px 14px',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}
    >
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6 }}>
        {label}
      </p>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, textTransform: 'capitalize' }}>{p.name}:</span>
          <span style={{ color: '#fff', fontSize: 10, fontWeight: 600 }}>{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export default function RequestActivityChart({ chartData5M, chartData1H }) {
  const [range, setRange] = useState('5M')

  const data = range === '5M' ? chartData5M : chartData1H

  return (
    <div className="glass-card p-6 relative overflow-hidden">
      {/* Subtle blob */}
      <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none"
           style={{ background: 'rgba(255,255,255,0.03)' }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-white/60">
          Request Activity
        </h2>
        <div className="flex gap-1 border border-white/10 rounded-lg p-0.5">
          {['5M', '1H'].map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-[10px] font-semibold tracking-widest uppercase rounded transition-all
                ${range === r ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart — ComposedChart: Area fills + Line on top */}
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          {/* Gradient defs */}
          <defs>
            <linearGradient id="gradAllowed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#ffffff" stopOpacity={0.08} />
              <stop offset="95%" stopColor="#ffffff" stopOpacity={0}    />
            </linearGradient>
            <linearGradient id="gradSuspicious" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#fbbf24" stopOpacity={0.10} />
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}    />
            </linearGradient>
            <linearGradient id="gradBlocked" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#f87171" stopOpacity={0.10} />
              <stop offset="95%" stopColor="#f87171" stopOpacity={0}    />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Area fills (behind lines) — isAnimationActive draws them in */}
          <Area
            type="monotone" dataKey="allowed"
            stroke="none" fill="url(#gradAllowed)"
            isAnimationActive={true} animationDuration={1400}
          />
          <Area
            type="monotone" dataKey="suspicious"
            stroke="none" fill="url(#gradSuspicious)"
            isAnimationActive={true} animationDuration={1600}
          />
          <Area
            type="monotone" dataKey="blocked"
            stroke="none" fill="url(#gradBlocked)"
            isAnimationActive={true} animationDuration={1800}
          />

          {/* Lines on top of areas */}
          <Line type="monotone" dataKey="allowed"
            stroke="#ffffff" strokeWidth={2} dot={false} name="Allowed"
            isAnimationActive={true} animationDuration={1400} />
          <Line type="monotone" dataKey="suspicious"
            stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="5 4" dot={false} name="Suspicious"
            isAnimationActive={true} animationDuration={1600} />
          <Line type="monotone" dataKey="blocked"
            stroke="#f87171" strokeWidth={1.5} strokeDasharray="5 4" dot={false} name="Blocked"
            isAnimationActive={true} animationDuration={1800} />

          <Legend
            wrapperStyle={{ paddingTop: '16px' }}
            formatter={value => (
              <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
                {value}
              </span>
            )}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
