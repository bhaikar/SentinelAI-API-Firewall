// ─── Aggregate stats ────────────────────────────────────────────────────────
export const stats = {
  totalRequests: 124,
  blocked: 18,
  suspicious: 9,
  allowed: 97,
  securityScore: 84,
}

// ─── 24-hour request activity ────────────────────────────────────────────────
export const requestActivity = [
  { time: '04:00', allowed: 3200, suspicious:  800, blocked:  200 },
  { time: '08:00', allowed: 4100, suspicious:  950, blocked:  380 },
  { time: '12:00', allowed: 5800, suspicious: 1200, blocked:  520 },
  { time: '16:00', allowed: 6900, suspicious: 1800, blocked:  680 },
  { time: '20:00', allowed: 8200, suspicious: 2100, blocked:  890 },
  { time: '24:00', allowed: 9100, suspicious: 2400, blocked:  950 },
]

// ─── Attack-type distribution ────────────────────────────────────────────────
export const attackTypes = [
  { name: 'SQL Injection',        value: 35, color: '#ffffff' },
  { name: 'XSS',                  value: 22, color: '#aaaaaa' },
  { name: 'Unauthorized Access',  value: 18, color: '#ff4444' },
  { name: 'Payload Manipulation', value: 15, color: '#ffaa00' },
  { name: 'Rate Abuse',           value: 10, color: '#44aaaa' },
]

// ─── Endpoint risk table ─────────────────────────────────────────────────────
export const endpoints = [
  { path: '/login',    requests: 45, blocked: 8, risk: 'HIGH'     },
  { path: '/admin',    requests: 12, blocked: 7, risk: 'CRITICAL' },
  { path: '/payment',  requests: 20, blocked: 3, risk: 'MEDIUM'   },
  { path: '/profile',  requests: 30, blocked: 0, risk: 'LOW'      },
  { path: '/api/data', requests: 17, blocked: 0, risk: 'LOW'      },
]

// ─── Live request logs ───────────────────────────────────────────────────────
export const requestLogs = [
  { time: '12:01', endpoint: '/login',    method: 'POST', riskScore: 85, status: 'BLOCKED',    reason: 'SQL Injection'      },
  { time: '12:03', endpoint: '/admin',    method: 'GET',  riskScore: 91, status: 'BLOCKED',    reason: 'Unauthorized Access' },
  { time: '12:05', endpoint: '/profile',  method: 'GET',  riskScore: 12, status: 'ALLOWED',    reason: 'Normal'             },
  { time: '12:06', endpoint: '/login',    method: 'POST', riskScore: 67, status: 'SUSPICIOUS', reason: 'Unusual Pattern'    },
  { time: '12:08', endpoint: '/payment',  method: 'POST', riskScore: 23, status: 'ALLOWED',    reason: 'Normal'             },
  { time: '12:09', endpoint: '/admin',    method: 'POST', riskScore: 95, status: 'BLOCKED',    reason: 'Payload Attack'     },
  { time: '12:11', endpoint: '/api/data', method: 'GET',  riskScore:  8, status: 'ALLOWED',    reason: 'Normal'             },
]

// ─── AI Threat Summary ───────────────────────────────────────────────────────
export const threatSummary = {
  text: "Multiple SQL injection attempts detected targeting /login endpoint over the last 10 minutes. Unauthorized admin access attempts have been blocked. Current threat level is elevated. Recommend reviewing login rate limits immediately.",
  indicators: [
    { name: 'SQL Injection',       status: 'ACTIVE'     },
    { name: 'Unauthorized Access', status: 'BLOCKED'    },
    { name: 'Rate Abuse',          status: 'MONITORING' },
  ],
  lastUpdated: '17:52:03 UTC',
}
