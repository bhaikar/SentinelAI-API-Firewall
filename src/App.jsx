// ─── App.jsx ──────────────────────────────────────────────────────────────────
// Root layout — staggered page-load animations applied to every section

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

export default function App() {
  return (
    <div className="min-h-screen text-white">

      {/* ── Navbar fades in from top (delay 0) ── */}
      <div className="anim-enter delay-0">
        <Navbar />
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
            <MetricCards />
          </div>
        </section>

        {/* ── THREATS — activity chart ── */}
        <section id="threats" className="anim-enter delay-700">
          <RequestActivityChart />
        </section>

        {/* ── ENDPOINTS — attack distribution + endpoint risk table ── */}
        <section id="endpoints" className="grid grid-cols-2 gap-4 anim-enter delay-800">
          <AttackDistribution />
          <EndpointRiskTable />
        </section>

        {/* ── LOGS — live logs + AI summary ── */}
        <section id="logs" className="grid grid-cols-[70%_1fr] gap-4 anim-enter delay-900">
          <LiveRequestLogs />
          <AIThreatSummary />
        </section>

        {/* Row 5 — Risk gauge + Attack simulator */}
        <div className="grid grid-cols-2 gap-4 anim-enter" style={{ animationDelay: '1000ms' }}>
          <RiskGauge />
          <AttackSimulator />
        </div>

        {/* ── SETTINGS — system info bar ── */}
        <section id="settings" className="anim-enter" style={{ animationDelay: '1100ms' }}>
          <SystemInfo />
        </section>

      </main>
    </div>
  )
}
