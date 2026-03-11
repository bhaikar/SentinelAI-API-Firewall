const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/config');
const sentinelMiddleware = require('./middleware/sentinel');
const apiRoutes = require('./routes/api');
const securityRoutes = require('./routes/security');
const testRoutes = require('./routes/test');

const app = express();

// Basic Security Headers
app.use(helmet());

// CORS Configuration
app.use(cors({
  origin: '*'
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// 🛡️ SentinelAI Firewall Middleware - THIS IS THE CORE SECURITY LAYER
app.use(sentinelMiddleware);

// Routes
app.use('/api', apiRoutes);
app.use('/security', securityRoutes);
app.use('/test', testRoutes);

// Health Check (bypasses firewall)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'SentinelAI',
    timestamp: new Date().toISOString() 
  });
});

// Welcome Route
app.get('/', (req, res) => {
  res.json({
    service: 'SentinelAI - Adaptive Context-Aware API Security Firewall',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      health: '/health',
      security: '/security/*',
      api: '/api/*',
      test: '/test/*'
    },
    documentation: 'See README.md for complete API documentation'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
});

// Start Server
const PORT = config.port;
app.listen(PORT, () => {
  console.log('\n🛡️  ========================================');
  console.log('   SentinelAI Security Firewall Active');
  console.log('   ========================================');
  console.log(`   🚀 Server: http://localhost:${PORT}`);
  console.log(`   🔒 AI Mode: ${config.aiEnabled ? 'ENABLED' : 'DISABLED'}`);
  console.log(`   📊 Dashboard: http://localhost:5173`);
  console.log('   ========================================\n');
});

module.exports = app;
