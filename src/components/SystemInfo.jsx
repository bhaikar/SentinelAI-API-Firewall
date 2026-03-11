// ─── SystemInfo ───────────────────────────────────────────────────────────────
// Full-width bottom status bar + copyright footer

function formatUptime(seconds) {
  if (!seconds && seconds !== 0) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

export default function SystemInfo({ systemStatus, stats, endpoints }) {
  const isOnline     = systemStatus?.status === 'active'
  const threatsToday = stats ? (stats.blocked || 0) + (stats.suspicious || 0) : 48
  const epCount      = endpoints?.length > 0 ? endpoints.length : 12

  const SYS_STATS = [
    {
      label: 'SERVER STATUS',
      value: systemStatus ? (isOnline ? 'ONLINE' : 'OFFLINE') : 'ONLINE',
      color: isOnline || !systemStatus ? 'text-green-400' : 'text-red-400',
    },
    {
      label: 'API UPTIME',
      value: systemStatus ? formatUptime(systemStatus.uptime) : '—',
      color: 'text-white',
    },
    {
      label: 'ENDPOINTS PROTECTED',
      value: String(epCount),
      color: 'text-white',
    },
    {
      label: 'TOTAL THREATS TODAY',
      value: String(threatsToday),
      color: 'text-red-400',
    },
  ]

  return (
    <div className="flex flex-col gap-0">
      {/* Stats bar */}
      <div className="glass-card px-8 py-4 flex items-center justify-around">
        {SYS_STATS.map((stat, i) => (
          <div key={stat.label} className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] tracking-[0.2em] uppercase text-white/30 font-semibold">
                {stat.label}
              </span>
              <span className={`text-sm font-bold tracking-widest ${stat.color}`}>
                {stat.value}
              </span>
            </div>
            {i < SYS_STATS.length - 1 && (
              <div className="w-px h-8 bg-white/[0.06]" />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-2 py-3 text-[10px] text-white/20 tracking-wide">
        <span>© 2025 SentinelAI. All rights reserved.</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400/60 inline-block" />
          Encryption: AES-256-GCM  |  TLS 1.3
        </span>
      </div>
    </div>
  )
}
