// ─── backendService.js ────────────────────────────────────────────────────────
// All fetch calls to the SentinelAI backend at localhost:5000

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://sentinel-1-nxjs.onrender.com'

export async function getDashboardStats() {
  const res = await fetch(`${BASE_URL}/security/dashboard`)
  if (!res.ok) throw new Error('Failed to fetch stats')
  return await res.json()
}

export async function getLogs(limit = 20) {
  const res = await fetch(`${BASE_URL}/security/logs?limit=${limit}`)
  if (!res.ok) throw new Error('Failed to fetch logs')
  return await res.json()
}

export async function getSystemStatus() {
  const res = await fetch(`${BASE_URL}/security/status`)
  if (!res.ok) throw new Error('Failed to fetch status')
  return await res.json()
}

export async function resetDashboard() {
  const res = await fetch(`${BASE_URL}/security/reset`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to reset dashboard')
  return await res.json()
}

export async function triggerSQLInjection() {
  await fetch(`${BASE_URL}/test/sql-injection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: "admin' OR '1'='1",
      query: "SELECT * FROM users WHERE id=1 OR 1=1--"
    })
  })
}

export async function triggerXSS() {
  await fetch(`${BASE_URL}/test/xss-attack`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      comment: "<script>alert('XSS')</script>",
      name: "<img src=x onerror=alert('XSS')>"
    })
  })
}

export async function triggerRateAbuse() {
  const promises = Array(25).fill(null).map(() =>
    fetch(`${BASE_URL}/test/spam`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: 'rate-abuse-test' })
    })
  )
  await Promise.all(promises)
}

export async function triggerUnauthAccess() {
  await fetch(`${BASE_URL}/api/admin/users`)
}

export async function triggerPayloadAttack() {
  await fetch(`${BASE_URL}/test/command-injection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      command: "ls -la; cat /etc/passwd",
      input: "`whoami`"
    })
  })
}

export async function triggerGoodRequest() {
  await fetch(`${BASE_URL}/api/public`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0 Safari/537.36',
    },
  })
}
