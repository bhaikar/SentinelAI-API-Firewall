# 🚀 Quick Start Guide

## Get SentinelAI Running in 3 Minutes

### Step 1: Install Dependencies (1 minute)

```bash
# Navigate to project directory
cd sentinelai

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Start the Services (30 seconds)

**Terminal 1 - Backend:**
```bash
npm start
```
✅ Backend running at: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ Dashboard running at: http://localhost:3000

### Step 3: Test the Firewall (1 minute)

1. Open browser: http://localhost:3000
2. Click "Simulate Attack" on any attack card
3. Watch metrics update in real-time
4. View blocked requests in security log

## Quick Test with cURL

### Test 1: Safe Request (Should Pass)
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@test.com"}'
```

**Expected:** ✅ 201 Created

### Test 2: SQL Injection (Should Block)
```bash
curl -X POST http://localhost:5000/test/sql-injection \
  -H "Content-Type: application/json" \
  -d '{"username": "admin OR 1=1--"}'
```

**Expected:** 🛑 403 Forbidden

### Test 3: XSS Attack (Should Block)
```bash
curl -X POST http://localhost:5000/test/xss-attack \
  -H "Content-Type: application/json" \
  -d '{"comment": "<script>alert(\"XSS\")</script>"}'
```

**Expected:** 🛑 403 Forbidden

## Viewing Results

### Dashboard (http://localhost:3000)
- View real-time metrics
- See security score
- Check threat breakdown
- Review security logs

### API Endpoints
```bash
# Get dashboard data
curl http://localhost:5000/security/dashboard

# Get security logs
curl http://localhost:5000/security/logs

# Get blocked requests
curl http://localhost:5000/security/blocked
```

## Common Commands

### Development Mode (Auto-reload)
```bash
# Backend with nodemon
npm run dev

# Frontend with Vite HMR
cd frontend && npm run dev
```

### Reset All Metrics
```bash
curl -X POST http://localhost:5000/security/reset
```

### Check System Status
```bash
curl http://localhost:5000/security/status
```

## Troubleshooting

### Port Already in Use
```bash
# Change port in .env
PORT=5001
```

### Backend Connection Issues
1. Verify backend is running: http://localhost:5000/health
2. Check console for errors
3. Ensure .env file exists

### No Attacks Detected
- Check console logs for risk scores
- Lower BLOCK_THRESHOLD in .env (default: 70)
- Verify patterns in backend/config/config.js

## Next Steps

1. ✅ Basic setup complete
2. 📖 Read [README.md](README.md) for detailed docs
3. 🔧 Customize thresholds in `.env`
4. 🧪 Try all attack simulations
5. 🎨 Modify dashboard in `frontend/src/App.jsx`
6. 🔒 Add custom security patterns

## Demo Workflow

**Perfect for presentations:**

1. Start both servers
2. Open dashboard in browser
3. Show clean metrics (0 threats)
4. Run SQL injection attack
5. Point out:
   - Risk score calculation
   - Immediate blocking
   - Threat logged
   - Metrics updated
6. Try other attacks
7. Show security event log
8. Highlight security score

**Demo talking points:**
- Context-aware analysis
- Real-time threat prevention
- Hybrid risk scoring
- Attack pattern detection
- Rate limiting
- Security monitoring

---

**You're all set! 🎉**

The firewall is now protecting your API endpoints.
