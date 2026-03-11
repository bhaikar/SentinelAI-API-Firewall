# 🔧 Extending SentinelAI

Guide for customizing and extending the SentinelAI firewall.

## Adding Custom Attack Patterns

### Step 1: Define Pattern in Config

Edit `backend/config/config.js`:

```javascript
suspiciousPatterns: {
  // Existing patterns...
  
  // Add your custom pattern
  myCustomAttack: [
    /custom-pattern-here/gi,
    /another-pattern/gi
  ]
}
```

### Step 2: Add Detection Logic

Edit `backend/middleware/analyzer.js` in the `analyzePayload` method:

```javascript
// Custom Attack Detection
const customMatches = this.detectPattern(payloadString, config.suspiciousPatterns.myCustomAttack);
if (customMatches.length > 0) {
  result.score += 30; // Adjust risk points
  result.threats.push('my_custom_attack');
  result.reasons.push('Custom attack pattern detected');
}
```

### Step 3: Test Your Pattern

```bash
curl -X POST http://localhost:5000/test/safe \
  -H "Content-Type: application/json" \
  -d '{"input":"your-test-pattern"}'
```

---

## Adding Custom Endpoints

### Step 1: Create Route

Edit `backend/routes/api.js`:

```javascript
router.post('/custom/endpoint', (req, res) => {
  // Your logic here
  res.json({
    success: true,
    data: 'Custom endpoint response'
  });
});
```

### Step 2: Set Sensitivity

Edit `backend/config/config.js`:

```javascript
endpointSensitivity: {
  '/api/custom/endpoint': 25, // Risk score for accessing this endpoint
  // ...
}
```

### Step 3: Test

```bash
curl -X POST http://localhost:5000/api/custom/endpoint \
  -H "Content-Type: application/json" \
  -d '{"data":"test"}'
```

---

## Customizing Risk Scoring

### Adjust Global Thresholds

Edit `.env`:

```env
# Lower threshold = more aggressive blocking
BLOCK_THRESHOLD=60          # Default: 70

# Lower threshold = more AI usage
AI_ANALYSIS_THRESHOLD=40    # Default: 50
```

### Custom Scoring Logic

Edit `backend/middleware/analyzer.js`:

```javascript
analyzeRequest(requestData) {
  const analysis = {
    riskScore: 0,
    threats: [],
    reasons: []
  };
  
  // Add your custom scoring logic
  if (requestData.path.includes('/sensitive/')) {
    analysis.riskScore += 50;
    analysis.reasons.push('Accessing sensitive path');
  }
  
  // ... rest of analysis
  
  return analysis;
}
```

---

## Adding AI Providers

### Step 1: Create AI Client

Create `backend/middleware/aiProviders/customAI.js`:

```javascript
class CustomAIProvider {
  async analyze(requestData, riskScore, threats) {
    // Call your AI service
    const response = await fetch('https://your-ai-api.com/analyze', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer YOUR_KEY' },
      body: JSON.stringify({ requestData, riskScore, threats })
    });
    
    const result = await response.json();
    
    return {
      aiAnalyzed: true,
      recommendation: result.action, // 'allow', 'block', 'monitor'
      confidence: result.confidence,
      reasoning: result.explanation
    };
  }
}

module.exports = new CustomAIProvider();
```

### Step 2: Integrate in Analyzer

Edit `backend/middleware/aiAnalyzer.js`:

```javascript
const customAI = require('./aiProviders/customAI');

async analyzeRequest(requestData, riskScore, threats) {
  if (this.enabled) {
    return await customAI.analyze(requestData, riskScore, threats);
  }
  // ... fallback logic
}
```

---

## Custom Dashboard Components

### Adding a New Metric Card

Edit `frontend/src/App.jsx`:

```jsx
<div className="card">
  <div className="card-header">
    <YourIcon color="#your-color" />
    <h3>Your Metric</h3>
  </div>
  <div className="metric-value" style={{ color: '#your-color' }}>
    {metrics.yourCustomMetric}
  </div>
  <div className="metric-label">Your description</div>
</div>
```

### Adding New Visualizations

Install chart library:
```bash
cd frontend
npm install recharts
```

Add chart component:
```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// In your component
<LineChart width={600} height={300} data={yourData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="time" />
  <YAxis />
  <Tooltip />
  <Line type="monotone" dataKey="threats" stroke="#ef4444" />
</LineChart>
```

---

## Persistent Storage

### Using MongoDB

Install MongoDB driver:
```bash
npm install mongodb
```

Create `backend/storage/mongodb.js`:
```javascript
const { MongoClient } = require('mongodb');

class MongoStorage {
  constructor() {
    this.client = new MongoClient(process.env.MONGODB_URI);
    this.db = null;
  }
  
  async connect() {
    await this.client.connect();
    this.db = this.client.db('sentinelai');
  }
  
  async saveLog(logEntry) {
    await this.db.collection('logs').insertOne(logEntry);
  }
  
  async getLogs(filter = {}, limit = 50) {
    return await this.db.collection('logs')
      .find(filter)
      .limit(limit)
      .sort({ timestamp: -1 })
      .toArray();
  }
}

module.exports = new MongoStorage();
```

Update logger to use MongoDB:
```javascript
const mongoStorage = require('../storage/mongodb');

log(type, data) {
  const logEntry = { ...data, type, timestamp: new Date() };
  mongoStorage.saveLog(logEntry); // Save to MongoDB
  this.logs.unshift(logEntry);   // Keep in memory for quick access
}
```

### Using Redis

Install Redis client:
```bash
npm install redis
```

Create `backend/storage/redis.js`:
```javascript
const redis = require('redis');

class RedisStorage {
  constructor() {
    this.client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    this.client.connect();
  }
  
  async incrementMetric(key) {
    await this.client.incr(key);
  }
  
  async getMetrics() {
    const keys = await this.client.keys('metric:*');
    const values = await Promise.all(keys.map(k => this.client.get(k)));
    return keys.reduce((acc, key, i) => {
      acc[key.replace('metric:', '')] = parseInt(values[i]);
      return acc;
    }, {});
  }
}

module.exports = new RedisStorage();
```

---

## Adding Notifications

### Email Alerts

Install nodemailer:
```bash
npm install nodemailer
```

Create `backend/utils/notifications.js`:
```javascript
const nodemailer = require('nodemailer');

class Notifications {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  
  async sendThreatAlert(threat) {
    await this.transporter.sendMail({
      from: 'sentinel@yourdomain.com',
      to: 'admin@yourdomain.com',
      subject: `🚨 Security Alert: ${threat.type}`,
      html: `
        <h2>Security Threat Detected</h2>
        <p><strong>Type:</strong> ${threat.type}</p>
        <p><strong>Risk Score:</strong> ${threat.riskScore}</p>
        <p><strong>Path:</strong> ${threat.path}</p>
        <p><strong>IP:</strong> ${threat.ip}</p>
        <p><strong>Time:</strong> ${threat.timestamp}</p>
      `
    });
  }
}

module.exports = new Notifications();
```

Integrate in middleware:
```javascript
const notifications = require('../utils/notifications');

if (decision === 'blocked' && riskScore > 80) {
  notifications.sendThreatAlert(logData);
}
```

### Slack Notifications

```bash
npm install @slack/webhook
```

```javascript
const { IncomingWebhook } = require('@slack/webhook');

const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);

async function sendSlackAlert(threat) {
  await webhook.send({
    text: `🚨 *Security Alert*\n` +
          `Type: ${threat.type}\n` +
          `Risk: ${threat.riskScore}\n` +
          `Path: ${threat.path}`
  });
}
```

---

## Custom Middleware

### IP Whitelist

Create `backend/middleware/whitelist.js`:
```javascript
const WHITELIST = ['127.0.0.1', '::1', '192.168.1.100'];

module.exports = function ipWhitelist(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  if (req.path.startsWith('/admin') && !WHITELIST.includes(clientIP)) {
    return res.status(403).json({
      error: 'IP not whitelisted for admin access'
    });
  }
  
  next();
};
```

Add to server:
```javascript
app.use(ipWhitelist);
app.use(sentinelMiddleware);
```

### Geographic Blocking

```bash
npm install geoip-lite
```

```javascript
const geoip = require('geoip-lite');

function geoBlock(req, res, next) {
  const ip = req.ip;
  const geo = geoip.lookup(ip);
  
  const blockedCountries = ['XX', 'YY']; // ISO codes
  
  if (geo && blockedCountries.includes(geo.country)) {
    return res.status(403).json({
      error: 'Access denied from your location'
    });
  }
  
  next();
}
```

---

## Testing

### Unit Tests

Install Jest:
```bash
npm install --save-dev jest supertest
```

Create `backend/tests/sentinel.test.js`:
```javascript
const request = require('supertest');
const app = require('../server');

describe('SentinelAI Firewall', () => {
  test('Should block SQL injection', async () => {
    const response = await request(app)
      .post('/test/sql-injection')
      .send({ username: "admin' OR '1'='1" });
    
    expect(response.status).toBe(403);
    expect(response.body.code).toBe('SENTINEL_BLOCKED');
  });
  
  test('Should allow safe requests', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'John', email: 'john@test.com' });
    
    expect(response.status).toBe(201);
  });
});
```

Run tests:
```bash
npm test
```

---

## Performance Optimization

### Caching

```javascript
const cache = new Map();

function getCachedAnalysis(requestHash) {
  if (cache.has(requestHash)) {
    return cache.get(requestHash);
  }
  return null;
}

function cacheAnalysis(requestHash, analysis) {
  cache.set(requestHash, analysis);
  setTimeout(() => cache.delete(requestHash), 60000); // 1 min TTL
}
```

### Async Processing

For heavy AI analysis:
```javascript
const Queue = require('bull');
const analysisQueue = new Queue('ai-analysis');

analysisQueue.process(async (job) => {
  const { requestData, riskScore, threats } = job.data;
  return await aiAnalyzer.analyzeRequest(requestData, riskScore, threats);
});
```

---

## Production Checklist

- [ ] Enable HTTPS/TLS
- [ ] Configure environment variables
- [ ] Set up persistent storage (MongoDB/Redis)
- [ ] Enable AI analysis
- [ ] Configure email/Slack notifications
- [ ] Set up log aggregation
- [ ] Configure rate limiting per IP
- [ ] Add authentication for dashboard
- [ ] Set up monitoring/alerts
- [ ] Configure backup strategy
- [ ] Load test the system
- [ ] Review and tune thresholds
- [ ] Document custom patterns
- [ ] Set up CI/CD pipeline

---

## Need Help?

- Check existing patterns in `backend/config/config.js`
- Review middleware logic in `backend/middleware/`
- Examine dashboard code in `frontend/src/App.jsx`
- Test changes with demo scripts
- Monitor console logs for debugging

---

**Happy Extending! 🚀**
