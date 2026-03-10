import express from 'express'
import OpenAI  from 'openai'
import dotenv  from 'dotenv'

dotenv.config()

const router = express.Router()

// ── Grok client (OpenAI-compatible) ──────────────────────────────────────────
const grok = new OpenAI({
  apiKey:  process.env.GROK_API_KEY,
  baseURL: 'https://api.x.ai/v1',
})

async function askGrok(prompt) {
  const response = await grok.chat.completions.create({
    model:      'grok-beta',
    messages:   [{ role: 'user', content: prompt }],
    max_tokens: 500,
  })
  return response.choices[0].message.content
}

// ── ROUTE 1 — Threat Summary ─────────────────────────────────────────────────
// POST /api/threat-summary
// Body: { stats, attackTypes, topEndpoints }
router.post('/threat-summary', async (req, res) => {
  try {
    const { stats, attackTypes, topEndpoints } = req.body

    const prompt = `You are a cybersecurity AI for SentinelAI API Firewall. \
Analyze this real-time traffic data and generate a threat intelligence summary:

- Total Requests: ${stats.totalRequests}
- Blocked: ${stats.blocked}
- Suspicious: ${stats.suspicious}
- Allowed: ${stats.allowed}
- Security Score: ${stats.securityScore}/100
- Top Attack: ${attackTypes[0].name} (${attackTypes[0].value}%)
- Most Targeted: ${topEndpoints[0].path} (${topEndpoints[0].blocked} blocked)

Write a 3-4 sentence threat intelligence summary. \
Be specific, technical and concise. Sound like a real SOC analyst.`

    const summary = await askGrok(prompt)
    res.json({ success: true, summary })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ── ROUTE 2 — Attack Analysis ─────────────────────────────────────────────────
// POST /api/attack-analysis
// Body: { attackType, endpoint, riskScore }
router.post('/attack-analysis', async (req, res) => {
  try {
    const { attackType, endpoint, riskScore } = req.body

    const prompt = `A ${attackType} attack was simulated on ${endpoint} endpoint \
with risk score ${riskScore}. The SentinelAI firewall blocked it instantly.

In exactly 2 sentences:
1. What this attack attempted to do
2. Why the firewall blocked it

Be technical and specific.`

    const analysis = await askGrok(prompt)
    res.json({ success: true, analysis })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ── ROUTE 3 — Card Insights ───────────────────────────────────────────────────
// POST /api/card-insights
// Body: { stats }
router.post('/card-insights', async (req, res) => {
  try {
    const { stats } = req.body

    const prompt = `Based on these API security metrics:
- Total Requests: ${stats.totalRequests}
- Blocked: ${stats.blocked}
- Suspicious: ${stats.suspicious}
- Allowed: ${stats.allowed}
- Security Score: ${stats.securityScore}/100

Give exactly 5 micro-insights, one per metric. Each must be under 8 words.
Respond ONLY with this exact JSON format, no extra text, no markdown:
{
  "totalRequests": "insight here",
  "blocked": "insight here",
  "suspicious": "insight here",
  "allowed": "insight here",
  "score": "insight here"
}`

    const raw      = await askGrok(prompt)
    const insights = JSON.parse(raw)
    res.json({ success: true, insights })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ── ROUTE 4 — Risk Recommendation ────────────────────────────────────────────
// POST /api/risk-recommendation
// Body: { riskLevel, stats, topEndpoints }
router.post('/risk-recommendation', async (req, res) => {
  try {
    const { riskLevel, stats, topEndpoints } = req.body

    const prompt = `SentinelAI firewall is at ${riskLevel} risk level.
Stats: ${stats.blocked} blocked, ${stats.suspicious} suspicious.
Most targeted: ${topEndpoints[0].path} and ${topEndpoints[1].path}.

Give a specific 2-sentence security recommendation for the system administrator. \
Be actionable and technical.`

    const recommendation = await askGrok(prompt)
    res.json({ success: true, recommendation })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ── ROUTE 5 — Live Log Analysis ───────────────────────────────────────────────
// POST /api/log-analysis
// Body: { logs }
router.post('/log-analysis', async (req, res) => {
  try {
    const { logs } = req.body

    const logLines = logs
      .map(l => `${l.time} | ${l.endpoint} | ${l.method} | Risk:${l.riskScore} | ${l.status} | ${l.reason}`)
      .join('\n')

    const prompt = `Analyze these recent API security logs and identify the most \
critical pattern in 2 sentences:

${logLines}

What is the most concerning pattern and what action should be taken immediately?`

    const analysis = await askGrok(prompt)
    res.json({ success: true, analysis })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
