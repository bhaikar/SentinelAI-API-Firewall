// ─── aiService.js ────────────────────────────────────────────────────────────
// Fetch wrappers for the AI server at localhost:3001.
// All functions catch internally and return fallback values — never throw.

const AI_URL = 'http://localhost:3001/api'

export async function getThreatSummary(stats, attackTypes, endpoints) {
  try {
    const res = await fetch(`${AI_URL}/threat-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stats, attackTypes, topEndpoints: endpoints })
    })
    const data = await res.json()
    return data.summary
  } catch {
    return "AI analysis temporarily unavailable."
  }
}

export async function getAttackAnalysis(attackType, endpoint, riskScore) {
  try {
    const res = await fetch(`${AI_URL}/attack-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attackType, endpoint, riskScore })
    })
    const data = await res.json()
    return data.analysis
  } catch {
    return "AI analysis temporarily unavailable."
  }
}

export async function getCardInsights(stats) {
  try {
    const res = await fetch(`${AI_URL}/card-insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stats })
    })
    const data = await res.json()
    return data.insights
  } catch {
    return null
  }
}

export async function getRiskRecommendation(riskLevel, stats, endpoints) {
  try {
    const res = await fetch(`${AI_URL}/risk-recommendation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ riskLevel, stats, topEndpoints: endpoints })
    })
    const data = await res.json()
    return data.recommendation
  } catch {
    return "AI recommendation temporarily unavailable."
  }
}

export async function getLogAnalysis(logs) {
  try {
    const res = await fetch(`${AI_URL}/log-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logs })
    })
    const data = await res.json()
    return data.analysis
  } catch {
    return "AI analysis temporarily unavailable."
  }
}
