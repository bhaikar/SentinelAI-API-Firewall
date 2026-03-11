# 🛡️ SentinelAI - Adaptive Context-Aware API Security Firewall

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

## Overview

**SentinelAI** is an intelligent middleware-based security system designed to protect modern API-driven applications from malicious traffic. It acts as a smart security layer between users and backend services, analyzing every incoming API request before it reaches application logic.

The system evaluates requests using **contextual risk scoring** and **optional AI-assisted reasoning** to determine whether a request is safe, suspicious, or malicious.

## 🎯 Problem Statement

Modern applications rely heavily on APIs for authentication, data exchange, and business operations. However, many applications depend on static rule-based security mechanisms that lack contextual awareness.

**Common vulnerabilities:**
- SQL Injection attacks
- Cross-Site Scripting (XSS)
- Unauthorized endpoint access
- API abuse through repeated requests
- Malicious payload manipulation
- Command injection
- Path traversal attacks

Traditional security solutions often operate at infrastructure or network levels and cannot fully understand application-level behavior.

## ✨ Key Features

### 🔍 Context-Aware Request Analysis
Analyzes API requests using:
- Endpoint sensitivity scoring
- Payload structure analysis
- Header validation
- Request frequency monitoring
- Suspicious input pattern detection

### 🧠 Hybrid Risk Scoring Engine
Combines **rule-based scoring** with **optional AI-based classification** to determine threat levels:
- Pattern matching for known attack signatures
- Behavioral analysis
- AI-powered threat classification (optional)
- Adaptive learning from detected threats

### 🚫 Real-Time Threat Prevention
Blocks malicious API requests **before** they reach backend application logic:
- Immediate threat blocking
- Suspicious request flagging
- IP-based threat tracking
- Rate limiting

### 📊 Security Monitoring Dashboard
Real-time visibility into system activity:
- Total API requests processed
- Suspicious requests detected
- Blocked attacks
- Security score metrics
- Threat type breakdown
- Recent security events log
- Attack simulation tools

### 🎯 Attack Simulation
Built-in testing tools for:
- SQL Injection
- XSS (Cross-Site Scripting)
- Unauthorized Access
- Path Traversal
- Command Injection
- DDoS/Rate Limiting

## 🏗️ System Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│     Express.js Application          │
│  ┌───────────────────────────────┐  │
│  │   🛡️ SentinelAI Middleware   │  │
│  │                               │  │
│  │  1. Request Intercept         │  │
│  │  2. Context Analysis          │  │
│  │  3. Risk Scoring              │  │
│  │  4. AI Analysis (optional)    │  │
│  │  5. Decision: Allow/Block     │  │
│  └───────────────────────────────┘  │
│                │                     │
│       ┌────────┴────────┐           │
│       │                 │           │
│    BLOCKED           ALLOWED        │
│       │                 │           │
│   Return 403      Route to API      │
└──────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 16.0.0
- **npm** or **yarn**

### Installation

1. **Clone or extract the project**
   ```bash
   cd sentinelai
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Configure environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your settings (optional)
   # AI features are disabled by default
   ```

### Running the Application

#### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Start Backend:**
```bash
npm start
# or for development with auto-reload
npm run dev
```
Backend will run on: `http://localhost:5000`

**Terminal 2 - Start Frontend:**
```bash
npm run dev:frontend
```
Dashboard will run on: `http://localhost:3000`

#### Option 2: Quick Development Setup

```bash
# Terminal 1
npm run dev

# Terminal 2
cd frontend && npm run dev
```

### Accessing the Application

- **Backend API:** http://localhost:5000
- **Security Dashboard:** http://localhost:3000
- **Health Check:** http://localhost:5000/health

## 📖 API Documentation

### Security Endpoints

#### Get Dashboard Metrics
```http
GET /security/dashboard
```
Returns comprehensive security metrics including request counts, threats, and recent events.

#### Get Security Logs
```http
GET /security/logs?limit=50&type=blocked
```
**Query Parameters:**
- `limit` - Number of logs to return (default: 50)
- `type` - Filter by type: `allowed`, `suspicious`, `blocked`, or omit for all

#### Get System Status
```http
GET /security/status
```
Returns firewall status and configuration.

#### Reset Metrics
```http
POST /security/reset
```
Clears all metrics and logs (useful for testing).

### Protected API Endpoints

All endpoints under `/api/*` are protected by SentinelAI:

```http
GET  /api/users
POST /api/users
POST /api/auth/login
POST /api/auth/register
GET  /api/admin/users         # High sensitivity
POST /api/database/query      # Very high sensitivity
POST /api/payment/process     # High sensitivity
```

### Test Endpoints

#### Attack Simulation
```http
POST /test/sql-injection
POST /test/xss-attack
POST /test/unauthorized-admin
POST /test/path-traversal
POST /test/command-injection
POST /test/spam
```

#### Get Attack Scenarios
```http
GET /test/scenarios
```
Returns list of available attack simulations.

## 🔧 Configuration

### Environment Variables

Edit `.env` file to configure:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# AI Integration (Optional)
OPENAI_API_KEY=your_openai_api_key_here
AI_ENABLED=false

# Security Thresholds
MAX_RISK_SCORE=100
BLOCK_THRESHOLD=70        # Block requests with score >= 70
AI_ANALYSIS_THRESHOLD=50  # Use AI for scores >= 50

# Rate Limiting
RATE_LIMIT_POINTS=100
RATE_LIMIT_DURATION=60
```

### Risk Score Calculation

Risk scores are calculated based on:

| Factor | Risk Points |
|--------|-------------|
| Sensitive endpoint (admin, delete, etc.) | 20-35 |
| SQL injection pattern | +40 |
| XSS pattern | +35 |
| Path traversal pattern | +30 |
| Command injection pattern | +35 |
| Excessive request rate (>50/min) | +30 |
| Missing User-Agent | +10 |
| Previously flagged IP | +20 |
| Large payload (>10KB) | +15 |

**Total Risk Score:** Sum of all factors (capped at 100)

### Decision Logic

```javascript
if (riskScore >= 70) {
  // BLOCK immediately
  return 403 Forbidden
} else if (riskScore >= 50) {
  // SUSPICIOUS - Use AI analysis if enabled
  if (AI_ENABLED && aiConfidence > 0.7) {
    return 403 Forbidden
  }
  // Otherwise allow with warning
} else {
  // ALLOW - Safe request
}
```

## 🧪 Testing the Firewall

### Using the Dashboard

1. Open the dashboard at http://localhost:3000
2. Scroll to "Attack Simulator" section
3. Click any "Simulate Attack" button
4. Watch the metrics update in real-time
5. View blocked requests in the security log

### Using cURL

**Safe Request:**
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

**SQL Injection Attack (will be blocked):**
```bash
curl -X POST http://localhost:5000/test/sql-injection \
  -H "Content-Type: application/json" \
  -d '{"username": "admin OR 1=1--", "query": "SELECT * FROM users WHERE id=1 OR 1=1"}'
```

**XSS Attack (will be blocked):**
```bash
curl -X POST http://localhost:5000/test/xss-attack \
  -H "Content-Type: application/json" \
  -d '{"comment": "<script>alert(\"XSS\")</script>"}'
```

**Rate Limiting Test:**
```bash
# Send 100 rapid requests
for i in {1..100}; do
  curl -X POST http://localhost:5000/test/spam \
    -H "Content-Type: application/json" \
    -d '{"test": "data"}' &
done
```

## 📊 Dashboard Features

### Main Metrics
- **Total Requests:** All API requests processed
- **Suspicious Requests:** Requests flagged for monitoring
- **Blocked Threats:** Requests blocked before reaching application
- **Security Score:** Overall system health (0-100)

### Top Threats
Real-time breakdown of detected threat types:
- SQL Injection
- XSS
- Command Injection
- Path Traversal
- Rate Limiting Violations

### Security Event Log
Detailed log of all requests with:
- Timestamp
- HTTP method and path
- Risk score
- Decision (allowed/suspicious/blocked)
- Detected threats
- IP address
- Reason for blocking

### Attack Simulator
Interactive testing tools for demonstrating firewall capabilities.

## 🤖 AI Integration (Optional)

SentinelAI supports AI-powered threat analysis for ambiguous cases.

### Enabling AI

1. Get an API key from OpenAI or another LLM provider
2. Update `.env`:
   ```env
   AI_ENABLED=true
   OPENAI_API_KEY=your_actual_api_key
   ```
3. Restart the server

### How AI Analysis Works

When a request has a risk score between 50-70:
1. Request data is sent to AI for analysis
2. AI evaluates context and provides recommendation
3. If AI confidence > 70%, recommendation is followed
4. All decisions are logged for review

**Note:** AI analysis adds latency (~100-500ms per request). Use threshold settings to optimize performance.

## 🔒 Security Best Practices

### Production Deployment

1. **Enable HTTPS:** Use SSL/TLS certificates
2. **Configure AI:** Enable AI analysis for better accuracy
3. **Adjust Thresholds:** Fine-tune based on your traffic patterns
4. **Set Up Logging:** Integrate with log aggregation tools
5. **Monitor Metrics:** Set up alerts for high threat rates
6. **Database Backend:** Replace in-memory storage with Redis/MongoDB
7. **Rate Limiting:** Configure per your application needs

### Extending SentinelAI

The firewall is designed to be extensible:

**Add Custom Patterns:**
Edit `backend/config/config.js` to add detection patterns:
```javascript
suspiciousPatterns: {
  customAttack: [
    /your-pattern-here/gi
  ]
}
```

**Add Endpoint Sensitivity:**
```javascript
endpointSensitivity: {
  '/api/custom': 25,
  // ...
}
```

**Customize Risk Scoring:**
Modify `backend/middleware/analyzer.js` to adjust scoring logic.

## 📁 Project Structure

```
sentinelai/
├── backend/
│   ├── config/
│   │   └── config.js          # Configuration and patterns
│   ├── middleware/
│   │   ├── sentinel.js        # Core firewall middleware
│   │   ├── analyzer.js        # Security analysis engine
│   │   └── aiAnalyzer.js      # AI integration
│   ├── routes/
│   │   ├── api.js             # Protected API routes
│   │   ├── security.js        # Security dashboard API
│   │   └── test.js            # Attack simulation routes
│   ├── utils/
│   │   ├── logger.js          # Security event logging
│   │   └── metrics.js         # Metrics collection
│   └── server.js              # Express server
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Dashboard React app
│   │   ├── index.css          # Styling
│   │   └── main.jsx           # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .env                       # Environment configuration
├── .env.example               # Example configuration
├── package.json               # Backend dependencies
└── README.md                  # This file
```

## 🎓 Learning Outcomes

This project demonstrates:

1. **Middleware-based security architecture**
2. **Context-aware threat detection**
3. **Real-time security monitoring**
4. **AI integration for security analysis**
5. **Pattern matching for attack detection**
6. **Rate limiting and abuse prevention**
7. **Security metrics and visualization**

## 🐛 Troubleshooting

### Backend won't start
- Ensure port 5000 is not in use
- Check `.env` configuration
- Verify Node.js version >= 16

### Frontend can't connect to backend
- Verify backend is running on http://localhost:5000
- Check CORS settings in `backend/server.js`
- Clear browser cache

### Attacks not being blocked
- Check threshold settings in `.env`
- Review risk scoring in console logs
- Verify patterns in `backend/config/config.js`

### High false positive rate
- Increase `BLOCK_THRESHOLD` in `.env`
- Adjust endpoint sensitivity scores
- Fine-tune detection patterns

## 🤝 Contributing

This is an educational project demonstrating security concepts. Feel free to:
- Add new attack detection patterns
- Improve risk scoring algorithms
- Enhance the dashboard UI
- Add integration with real security tools

## 📄 License

MIT License - Feel free to use this project for learning and development.

## 🙏 Acknowledgments

- Built with Express.js, React, and modern web technologies
- Inspired by real-world API security challenges
- Designed for educational and demonstration purposes

## 📞 Support

For questions or issues:
1. Check the troubleshooting section
2. Review configuration in `.env`
3. Examine server logs for errors
4. Test with provided attack simulations

---

**⚠️ Disclaimer:** SentinelAI is an educational project demonstrating security concepts. For production use, conduct thorough security audits and integrate with enterprise-grade security solutions.

**Built with ❤️ to make APIs more secure**
