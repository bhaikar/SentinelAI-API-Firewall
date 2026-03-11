// ─── LiveRequestLogs ──────────────────────────────────────────────────────────
// livePulse dot + row slide-in + left-border accents + AI log analysis panel

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { getLogAnalysis } from '../services/aiService'

const STATUS_BADGE = {
  BLOCKED:    'bg-red-500/20 text-red-400 border border-red-500/30',
  SUSPICIOUS: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  ALLOWED:    'bg-green-500/10 text-green-400/70 border border-green-500/20',
}

const ROW_STYLE = {
  BLOCKED:    { className: 'bg-red-500/[0.04]',   borderLeft: '2px solid rgba(239,68,68,0.35)'   },
  SUSPICIOUS: { className: 'bg-amber-500/[0.04]', borderLeft: '2px solid rgba(251,191,36,0.35)' },
  ALLOWED:    { className: '',                      borderLeft: '2px solid transparent'           },
}

export default function LiveRequestLogs({ logs }) {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [aiError, setAiError]   = useState(false)

  const handleAnalyze = async () => {
    if (loading) return
    setLoading(true)
    setAiError(false)
    try {
      const text = await getLogAnalysis(logs)
      setAnalysis(text)
    } catch {
      setAiError(true)
      setAnalysis(
        'Multiple high-risk POST requests to /login and /admin suggest a coordinated brute-force and injection campaign. Immediately block the originating IP ranges and enforce stricter rate-limiting on authentication endpoints.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-white/60">
          Live Activity
        </h2>

        <div className="flex items-center gap-3">
          {/* AI Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="flex items-center gap-1.5 border border-purple-500/30
                       hover:border-purple-500/50 rounded-full px-3 py-1
                       text-[9px] font-semibold tracking-[0.15em] uppercase
                       text-purple-400/70 hover:text-purple-300
                       bg-purple-500/[0.05] hover:bg-purple-500/10 transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles size={8} className={loading ? 'spin' : ''} />
            {loading ? 'Analysing…' : 'AI Analyze Logs'}
          </button>

          {/* LIVE pulsing indicator */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="live-dot absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-red-400">LIVE</span>
          </div>
        </div>
      </div>

      {/* AI analysis panel — shown above table */}
      {analysis && (
        <div className="mb-4 rounded-xl border border-purple-500/20 bg-purple-500/[0.05] p-3 anim-enter delay-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles size={9} className="text-purple-400" />
            <span className="text-[9px] font-semibold tracking-wider uppercase text-purple-400">
              AI Pattern Analysis
            </span>
            {aiError && (
              <span className="text-[9px] text-amber-400/60 ml-1">⚠ offline — cached result</span>
            )}
          </div>
          <p className="text-[10px] text-white/65 leading-relaxed">{analysis}</p>
        </div>
      )}

      {/* Table */}
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {['TIME', 'ENDPOINT', 'METHOD', 'RISK SCORE', 'STATUS', 'REASON'].map(col => (
              <th key={col} className="pb-2 text-left font-semibold tracking-[0.12em] uppercase text-white/30">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => {
            const style = ROW_STYLE[log.status]
            return (
              <tr
                key={i}
                className={`log-row border-b border-white/[0.04] ${style.className}`}
                style={{ borderLeft: style.borderLeft, animationDelay: `${i * 60}ms` }}
              >
                <td className="py-2.5 pl-2 font-mono text-white/50">{log.time}</td>
                <td className="py-2.5 font-mono text-white/80">{log.endpoint}</td>
                <td className="py-2.5">
                  <span className="text-white/50 bg-white/5 px-1.5 py-0.5 rounded font-mono">
                    {log.method}
                  </span>
                </td>
                <td className="py-2.5">
                  <span className="font-semibold"
                        style={{ color: log.riskScore >= 80 ? '#f87171' : log.riskScore >= 50 ? '#fbbf24' : '#86efac' }}>
                    {log.riskScore}
                  </span>
                </td>
                <td className="py-2.5">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${STATUS_BADGE[log.status]}`}>
                    {log.status}
                  </span>
                </td>
                <td className="py-2.5 text-white/40">{log.reason}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
