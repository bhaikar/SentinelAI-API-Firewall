# SentinelAI AI Server

Node.js + Express server powering AI features using the Grok API (OpenAI-compatible).

## Setup

```bash
cd AI
npm install
```

Add your key to `.env`:
```
GROK_API_KEY=your_grok_api_key_here
PORT=3001
```

```bash
npm run dev   # development (requires nodemon)
npm start     # production
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET  | `/health` | Server health check |
| POST | `/api/threat-summary` | AI threat intelligence summary |
| POST | `/api/attack-analysis` | Explain a simulated attack |
| POST | `/api/card-insights` | Micro-insights for metric cards |
| POST | `/api/risk-recommendation` | Admin security recommendation |
| POST | `/api/log-analysis` | Pattern analysis across request logs |

## Request bodies

**`/api/threat-summary`**
```json
{ "stats": {...}, "attackTypes": [...], "topEndpoints": [...] }
```

**`/api/attack-analysis`**
```json
{ "attackType": "SQL Injection", "endpoint": "/login", "riskScore": 85 }
```

**`/api/card-insights`**
```json
{ "stats": {...} }
```

**`/api/risk-recommendation`**
```json
{ "riskLevel": "MEDIUM", "stats": {...}, "topEndpoints": [...] }
```

**`/api/log-analysis`**
```json
{ "logs": [...] }
```
