// ─── AttackDistribution ───────────────────────────────────────────────────────
// Animated donut draw-in + count-up centre + staggered legend fade

import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
} from 'recharts'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div style={{
      background: 'rgba(10,10,15,0.92)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 10,
      padding: '8px 12px',
      backdropFilter: 'blur(16px)',
    }}>
      <span style={{ color: d.payload.color, fontWeight: 600, fontSize: 11 }}>{d.name}</span>
      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, marginLeft: 8 }}>{d.value}%</span>
    </div>
  )
}

// Count-up to TOTAL
function useTotalCountUp(target, duration = 1200, startDelay = 600) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let raf
    let start = null
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

export default function AttackDistribution({ attackTypes }) {
  const total = attackTypes.reduce((s, d) => s + d.value, 0)
  const animatedTotal = useTotalCountUp(total)

  return (
    <div className="glass-card p-6 relative overflow-hidden">
      {/* Blob accent */}
      <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full blur-3xl pointer-events-none"
           style={{ background: 'rgba(255,68,68,0.1)' }} />

      <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-white/60 mb-4">
        Threat Breakdown
      </h2>

      <div className="flex items-center gap-4">
        {/* Donut — isAnimationActive triggers spin-in draw */}
        <div className="relative shrink-0" style={{ width: 150, height: 150 }}>
          <ResponsiveContainer width={150} height={150}>
            <PieChart>
              <Pie
                data={attackTypes}
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={66}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                strokeWidth={0}
                isAnimationActive={true}
                animationBegin={200}
                animationDuration={1000}
                animationEasing="ease-out"
              >
                {attackTypes.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Animated centre count */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-white leading-none tabular-nums">
              {animatedTotal}
            </span>
            <span className="text-[9px] tracking-widest uppercase text-white/40 mt-0.5">Total</span>
          </div>
        </div>

        {/* Staggered legend items */}
        <ul className="flex flex-col gap-2.5 text-xs">
          {attackTypes.map((item, i) => (
            <li
              key={item.name}
              className="flex items-center gap-2 anim-enter"
              style={{ animationDelay: `${400 + i * 80}ms` }}
            >
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ background: item.color }}
              />
              <span className="text-white/60 flex-1">{item.name}</span>
              <span className="text-white font-semibold">{item.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
