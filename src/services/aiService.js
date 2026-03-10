// ─── aiService.js ─────────────────────────────────────────────────────────────
// Thin fetch wrappers for every AI Server endpoint.
// All functions throw on network failure so callers can catch + show fallback.

const AI_SERVER = 'http://localhost:3001/api'

// ── Helper ─────────────────────────────────────────────────────────────────────
async function post(path, body) {
  const res  = await fetch(`${AI_SERVER}${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'AI server error')
  return data
}

// ── Exports ────────────────────────────────────────────────────────────────────

export async function getThreatSummary(stats, attackTypes, endpoints) {
  const data = await post('/threat-summary', {
    stats,
    attackTypes,
    topEndpoints: endpoints,
  })
  return data.summary
}

export async function getAttackAnalysis(attackType, endpoint, riskScore) {
  const data = await post('/attack-analysis', { attackType, endpoint, riskScore })
  return data.analysis
}

export async function getCardInsights(stats) {
  const data = await post('/card-insights', { stats })
  return data.insights   // { totalRequests, blocked, suspicious, allowed, score }
}

export async function getRiskRecommendation(riskLevel, stats, endpoints) {
  const data = await post('/risk-recommendation', {
    riskLevel,
    stats,
    topEndpoints: endpoints,
  })
  return data.recommendation
}

export async function getLogAnalysis(logs) {
  const data = await post('/log-analysis', { logs })
  return data.analysis
}
