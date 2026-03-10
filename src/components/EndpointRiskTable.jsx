// ─── EndpointRiskTable ────────────────────────────────────────────────────────
// Half-width table showing per-endpoint request + risk data


const RISK_STYLE = {
  CRITICAL: 'bg-red-500/20 text-red-400 border border-red-500/30',
  HIGH:     'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  MEDIUM:   'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  LOW:      'bg-white/5 text-white/40 border border-white/10',
}

export default function EndpointRiskTable({ endpoints }) {
  return (
    <div className="glass-card p-6 relative overflow-hidden">
      {/* Blob accent */}
      <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full blur-3xl pointer-events-none"
           style={{ background: 'rgba(255,170,0,0.08)' }} />

      <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-white/60 mb-4">
        API Targets
      </h2>

      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {['ENDPOINT', 'REQUESTS', 'BLOCKED', 'RISK'].map(col => (
              <th
                key={col}
                className="pb-2 text-left font-semibold tracking-[0.14em] uppercase text-white/30"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {endpoints.map((row, i) => (
            <tr
              key={row.path}
              className={`border-b border-white/[0.04] ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}
            >
              <td className="py-2.5 font-mono text-white/80">{row.path}</td>
              <td className="py-2.5 text-white/60">{row.requests}</td>
              <td className="py-2.5 text-white/60">{row.blocked}</td>
              <td className="py-2.5">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${RISK_STYLE[row.risk]}`}>
                  {row.risk}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
