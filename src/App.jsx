// ─── App.jsx ──────────────────────────────────────────────────────────────────
// Root layout — staggered page-load animations applied to every section

import { useState, useEffect } from 'react'
import Navbar               from './components/Navbar'
import MetricCards          from './components/MetricCards'
import RequestActivityChart from './components/RequestActivityChart'
import AttackDistribution   from './components/AttackDistribution'
import EndpointRiskTable    from './components/EndpointRiskTable'
import LiveRequestLogs      from './components/LiveRequestLogs'
import AIThreatSummary      from './components/AIThreatSummary'
import RiskGauge            from './components/RiskGauge'
import AttackSimulator      from './components/AttackSimulator'
import SystemInfo           from './components/SystemInfo'
import {
  getDashboardStats,
  getLogs,
} from './services/backendService'


function buildChartData(logs, rangeMinutes, bucketMinutes) {
  const now = Date.now()
  const rangeMs  = rangeMinutes * 60_000
  const bucketMs = bucketMinutes * 60_000
  const bucketCount = Math.ceil(rangeMinutes / bucketMinutes)

  // Pre-fill all buckets so the chart always shows a full timeline
  const buckets = []
  for (let i = bucketCount - 1; i >= 0; i--) {
    const end   = now - i * bucketMs
    const start = end - bucketMs
    const label = new Date(end).toLocaleTimeString('en-US', {
      hour12: false, hour: '2-digit', minute: '2-digit',
    })
    buckets.push({ time: label, allowed: 0, suspicious: 0, blocked: 0, _start: start, _end: end })
  }

  // Place each log into its bucket
  logs.forEach(log => {
    const ts = new Date(log.timestamp || Date.now()).getTime()
    if (ts < now - rangeMs) return
    for (const b of buckets) {
      if (ts >= b._start && ts < b._end) {
        if      (log.type === 'allowed')    b.allowed++
        else if (log.type === 'suspicious') b.suspicious++
        else if (log.type === 'blocked')    b.blocked++
        break
      }
    }
  })

  return buckets.map(({ _start, _end, ...rest }) => rest)
}

const ATTACK_COLORS = {
  'SQL Injection':        '#ffffff',
  'XSS':                 '#aaaaaa',
  'Unauthorized Access':  '#ff4444',
  'Payload Manipulation': '#ffaa00',
  'Rate Abuse':           '#44aaaa',
}

export default function App() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    blocked:       0,
    suspicious:    0,
    allowed:       0,
    securityScore: 0,
  })
  const [logs,         setLogs]         = useState([])
  const [endpoints,    setEndpoints]    = useState([])
  const [attackTypes,  setAttackTypes]  = useState([])
  const [chartData5M,  setChartData5M]  = useState([])
  const [chartData1H,  setChartData1H]  = useState([])
  const [isLive,       setIsLive]       = useState(false)

  async function fetchAllData() {
    try {
      const [dashboard, logsData] = await Promise.all([
        getDashboardStats(),
        getLogs(500),
      ])

      // Map dashboard → stats
      setStats({
        totalRequests: dashboard.totalRequests,
        blocked:       dashboard.blockedRequests,
        suspicious:    dashboard.suspiciousRequests,
        allowed:       dashboard.allowedRequests,
        securityScore: dashboard.securityScore,
      })

      // Build chart time-series from raw logs
      const rawLogs = logsData?.logs || []
      setChartData5M(buildChartData(rawLogs, 5, 1))   // 5 min, 1-min buckets
      setChartData1H(buildChartData(rawLogs, 60, 5))   // 1 hr, 5-min buckets

      // Map logs → table format
      if (logsData?.logs?.length > 0) {
        setLogs(logsData.logs.map(log => ({
          time: new Date(log.timestamp).toLocaleTimeString('en-US', {
            hour12: false, hour: '2-digit', minute: '2-digit',
          }),
          endpoint:  log.path,
          method:    log.method,
          riskScore: log.riskScore,
          status:    log.type === 'blocked'    ? 'BLOCKED'
                   : log.type === 'suspicious' ? 'SUSPICIOUS'
                   : 'ALLOWED',
          reason: log.reason || 'Normal',
        })))
      }

      // Map vulnerable endpoints
      if (dashboard.vulnerableEndpoints?.length > 0) {
        setEndpoints(dashboard.vulnerableEndpoints.map(ep => ({
          path:     ep.path,
          requests: ep.threats + ep.blocked,
          blocked:  ep.blocked,
          risk:     ep.blocked >= 5 ? 'CRITICAL'
                  : ep.blocked >= 3 ? 'HIGH'
                  : ep.blocked >= 1 ? 'MEDIUM'
                  : 'LOW',
        })))
      }

      // Map threatsByType → attackTypes
      if (dashboard.threatsByType) {
        const total = Object.values(dashboard.threatsByType).reduce((a, b) => a + b, 0)
        if (total > 0) {
          setAttackTypes(
            Object.entries(dashboard.threatsByType).map(([name, count]) => ({
              name,
              value: Math.round((count / total) * 100),
              color: ATTACK_COLORS[name] || '#888888',
            }))
          )
        }
      }

      setIsLive(true)
    } catch {
      // Backend unavailable — keep showing mock/last data silently
      setIsLive(false)
    }
  }

  useEffect(() => {
    fetchAllData()
    const interval = setInterval(fetchAllData, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen text-white">

      {/* ── Navbar fades in from top (delay 0) ── */}
      <div className="anim-enter delay-0">
        <Navbar isLive={isLive} />
      </div>

      {/* ── Main content ── */}
      <main className="max-w-[1400px] mx-auto px-6 py-8 flex flex-col gap-6">

        {/* ── DASHBOARD — hero + metric cards ── */}
        <section id="dashboard">
          {/* Hero title — slide up with glow (delay 100ms) */}
          <div className="anim-enter delay-100 flex flex-col gap-1 mb-6">
            <h1 className="hero-title text-5xl font-bold tracking-tight text-white uppercase">
              Security Dashboard
            </h1>
            {/* Terminal subtitle with blinking cursor */}
            <p className="cursor-blink text-xs tracking-[0.22em] uppercase text-white/30 font-mono mt-1">
              Real-time threat monitoring active
            </p>
          </div>

          {/* Row 1 — Metric cards */}
          <div className="anim-enter delay-200">
            <MetricCards stats={stats} />
          </div>
        </section>

        {/* ── THREATS — activity chart ── */}
        <section id="threats" className="anim-enter delay-700">
          <RequestActivityChart chartData5M={chartData5M} chartData1H={chartData1H} />
        </section>

        {/* ── ENDPOINTS — attack distribution + endpoint risk table ── */}
        <section id="endpoints" className="grid grid-cols-2 gap-4 anim-enter delay-800">
          <AttackDistribution attackTypes={attackTypes} />
          <EndpointRiskTable endpoints={endpoints} />
        </section>

        {/* ── LOGS — live logs + AI summary ── */}
        <section id="logs" className="grid grid-cols-[70%_1fr] gap-4 anim-enter delay-900">
          <LiveRequestLogs logs={logs} />
          <AIThreatSummary stats={stats} attackTypes={attackTypes} endpoints={endpoints} />
        </section>

        {/* Row 5 — Risk gauge + Attack simulator */}
        <div className="grid grid-cols-2 gap-4 anim-enter" style={{ animationDelay: '1000ms' }}>
          <RiskGauge stats={stats} endpoints={endpoints} />
          <AttackSimulator onRefresh={fetchAllData} />
        </div>

        {/* ── SETTINGS — system info bar ── */}
        <section id="settings" className="anim-enter" style={{ animationDelay: '1100ms' }}>
          <SystemInfo stats={stats} endpoints={endpoints} />
        </section>

      </main>
    </div>
  )
}
