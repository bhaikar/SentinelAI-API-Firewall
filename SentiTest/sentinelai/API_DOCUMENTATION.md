# 🔌 SentinelAI API Reference

Complete API documentation for SentinelAI endpoints.

## Base URL
```
http://localhost:5000
```

---

## 🔒 Security Monitoring Endpoints

### Get Dashboard Summary
Retrieve comprehensive security metrics and recent threats.

```http
GET /security/dashboard
```

**Response:**
```json
{
  "totalRequests": 150,
  "allowedRequests": 120,
  "suspiciousRequests": 15,
  "blockedRequests": 15,
  "securityScore": 85,
  "threatsByType": {
    "sql_injection": 8,
    "xss": 5,
    "command_injection": 2
  },
  "topThreats": [
    {"type": "sql_injection", "count": 8},
    {"type": "xss", "count": 5}
  ],
  "vulnerableEndpoints": [
    {
      "path": "/api/admin/users",
      "threats": 10,
      "blocked": 8,
      "suspicious": 2,
      "averageRisk": 75
    }
  ],
  "uptime": 3600,
  "threatRate": "10.00",
  "recentThreats": [
    {
      "timestamp": "2026-03-05T10:30:00Z",
      "method": "POST",
      "path": "/test/sql-injection",
      "ip": "::1",
      "riskScore": 85,
      "reason": "SQL injection patterns detected"
    }
  ]
}
```

---

### Get Security Metrics
Retrieve detailed system metrics.

```http
GET /security/metrics
```

**Response:**
```json
{
  "totalRequests": 150,
  "allowedRequests": 120,
  "suspiciousRequests": 15,
  "blockedRequests": 15,
  "securityScore": 85,
  "threatsByType": {
    "sql_injection": 8,
    "xss": 5
  },
  "topThreats": [...],
  "vulnerableEndpoints": [...],
  "uptime": 3600,
  "threatRate": "10.00"
}
```

---

### Get Security Logs
Retrieve filtered security event logs.

```http
GET /security/logs?limit=50&type=blocked
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | integer | 50 | Number of logs to return (max 1000) |
| type | string | all | Filter: `allowed`, `suspicious`, `blocked`, or omit for all |

**Response:**
```json
{
  "total": 15,
  "logs": [
    {
      "id": "uuid-here",
      "timestamp": "2026-03-05T10:30:00Z",
      "type": "blocked",
      "method": "POST",
      "path": "/test/sql-injection",
      "ip": "::1",
      "userAgent": "curl/7.64.1",
      "riskScore": 85,
      "decision": "blocked",
      "threats": ["sql_injection"],
      "reason": "SQL injection patterns detected: select * from users",
      "aiAnalysis": null,
      "processingTime": 15
    }
  ]
}
```

---

### Get Blocked Requests
Get only blocked malicious requests.

```http
GET /security/blocked
```

**Response:**
```json
{
  "total": 15,
  "blocked": [...]
}
```

---

### Get Suspicious Requests
Get flagged suspicious requests.

```http
GET /security/suspicious
```

**Response:**
```json
{
  "total": 8,
  "suspicious": [...]
}
```

---

### Get System Status
Check firewall status and configuration.

```http
GET /security/status
```

**Response:**
```json
{
  "status": "active",
  "service": "SentinelAI Firewall",
  "version": "1.0.0",
  "ai_enabled": false,
  "thresholds": {
    "block": 70,
    "ai_analysis": 50
  },
  "uptime": 3600
}
```

---

### Reset Metrics
Clear all metrics and logs (useful for testing).

```http
POST /security/reset
```

**Response:**
```json
{
  "success": true,
  "message": "All security metrics and logs have been reset"
}
```

---

## 🌐 Protected API Endpoints

All endpoints under `/api/*` are protected by SentinelAI.

### Get Public Info
```http
GET /api/public/info
```

**Risk Level:** Low (5 points)

---

### Get Users
```http
GET /api/users
```

**Risk Level:** Medium (15 points)

**Response:**
```json
{
  "users": [
    {"id": 1, "name": "Alice", "role": "user"}
  ]
}
```

---

### Create User
```http
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Risk Level:** Medium (15 points)

---

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Risk Level:** High (20 points)

---

### Get Admin Users
```http
GET /api/admin/users
```

**Risk Level:** Very High (30 points)
**Note:** Attempts without proper authentication will be flagged.

---

### Database Query
```http
POST /api/database/query
Content-Type: application/json

{
  "query": "SELECT * FROM users WHERE id = 1"
}
```

**Risk Level:** Critical (35 points)
**Note:** SQL injection patterns will be detected and blocked.

---

### Process Payment
```http
POST /api/payment/process
Content-Type: application/json

{
  "amount": 99.99,
  "card": "****-****-****-1234"
}
```

**Risk Level:** Very High (30 points)

---

## 🧪 Attack Simulation Endpoints

### Safe Request Test
```http
POST /test/safe
Content-Type: application/json

{
  "data": "normal safe data"
}
```

**Expected:** 200 OK

---

### SQL Injection Test
```http
POST /test/sql-injection
Content-Type: application/json

{
  "username": "admin' OR '1'='1",
  "query": "SELECT * FROM users WHERE id=1 OR 1=1--"
}
```

**Expected:** 403 Forbidden (Risk ~85)

---

### XSS Attack Test
```http
POST /test/xss-attack
Content-Type: application/json

{
  "comment": "<script>alert('XSS')</script>",
  "name": "<img src=x onerror=alert('XSS')>"
}
```

**Expected:** 403 Forbidden (Risk ~80)

---

### Unauthorized Admin Access
```http
POST /test/unauthorized-admin
```

**Expected:** 403 Forbidden (Risk ~70)

---

### Path Traversal Test
```http
POST /test/path-traversal
Content-Type: application/json

{
  "file": "../../etc/passwd",
  "path": "../../../windows/system32"
}
```

**Expected:** 403 Forbidden (Risk ~75)

---

### Command Injection Test
```http
POST /test/command-injection
Content-Type: application/json

{
  "command": "ls -la; cat /etc/passwd",
  "input": "`whoami`"
}
```

**Expected:** 403 Forbidden (Risk ~80)

---

### Rate Limiting Test
```http
POST /test/spam
Content-Type: application/json

{
  "data": "test"
}
```

Send 50+ requests in 60 seconds to trigger rate limiting.

**Expected:** 403 Forbidden after threshold

---

### Get Attack Scenarios
```http
GET /test/scenarios
```

**Response:**
```json
{
  "scenarios": [
    {
      "id": 1,
      "name": "SQL Injection",
      "description": "Attempts to inject SQL commands",
      "endpoint": "/test/sql-injection",
      "payload": {...}
    }
  ]
}
```

---

## 📊 Risk Scoring Reference

### Endpoint Sensitivity
| Endpoint Pattern | Base Risk |
|-----------------|-----------|
| `/api/admin/*` | 30 |
| `/api/database/*` | 35 |
| `/api/payment/*` | 30 |
| `/api/config/*` | 30 |
| `/api/auth/login` | 20 |
| `/api/auth/register` | 15 |
| `/api/users/*` | 15 |
| `/api/public/*` | 5 |
| Default | 10 |

### Attack Pattern Detection
| Attack Type | Risk Points |
|------------|-------------|
| SQL Injection | +40 |
| XSS | +35 |
| Command Injection | +35 |
| Path Traversal | +30 |
| Rate Limit Violation (>50 req/min) | +30 |
| High Request Rate (>30 req/min) | +15 |
| Large Payload (>10KB) | +15 |
| Missing User-Agent | +10 |
| Previously Flagged IP | +20 |

### Decision Thresholds
```
Risk Score 0-49:   ✅ ALLOWED
Risk Score 50-69:  ⚠️  SUSPICIOUS (AI analysis if enabled)
Risk Score 70-100: 🛑 BLOCKED
```

---

## 🔐 Response Headers

All protected requests include security headers:

```
X-Sentinel-Risk-Score: 45
X-Sentinel-Decision: allowed
X-Request-Id: uuid-here
```

---

## ❌ Error Responses

### Request Blocked (403)
```json
{
  "error": "Request blocked by security firewall",
  "code": "SENTINEL_BLOCKED",
  "riskScore": 85,
  "threats": ["sql_injection", "xss"],
  "message": "This request has been identified as potentially malicious and has been blocked.",
  "requestId": "uuid-here",
  "timestamp": "2026-03-05T10:30:00Z"
}
```

### Endpoint Not Found (404)
```json
{
  "error": "Endpoint not found",
  "path": "/invalid/path"
}
```

---

## 🌟 Best Practices

### 1. Monitor Metrics Regularly
```bash
# Check security score
curl http://localhost:5000/security/metrics | jq '.securityScore'

# View recent threats
curl http://localhost:5000/security/blocked
```

### 2. Adjust Thresholds
Edit `.env` to fine-tune:
```env
BLOCK_THRESHOLD=70        # Lower = more aggressive
AI_ANALYSIS_THRESHOLD=50  # When to use AI
```

### 3. Review Logs
```bash
# All logs
curl http://localhost:5000/security/logs?limit=100

# Only blocked
curl http://localhost:5000/security/logs?type=blocked

# Only suspicious
curl http://localhost:5000/security/logs?type=suspicious
```

### 4. Test Custom Patterns
Add patterns to `backend/config/config.js` and test:
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"input": "your-test-pattern"}'
```

---

## 📞 Need Help?

- Check [README.md](README.md) for detailed documentation
- Review [QUICKSTART.md](QUICKSTART.md) for setup guide
- Examine server console logs for debugging
- Use `/security/status` to verify firewall state

---

**Last Updated:** March 2026
**Version:** 1.0.0
