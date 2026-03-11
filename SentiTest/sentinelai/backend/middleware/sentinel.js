const config = require('../config/config');
const analyzer = require('./analyzer');
const aiAnalyzer = require('./aiAnalyzer');
const logger = require('../utils/logger');
const metrics = require('../utils/metrics');

async function sentinelMiddleware(req, res, next) {
  // Skip firewall for monitoring/security routes
  if (req.path.startsWith('/security/') || req.path === '/health') {
    return next();
  }

  const startTime = Date.now();

  try {
    const requestData = {
      method: req.method,
      path: req.path,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent') || 'unknown',
      headers: req.headers,
      body: req.body,
      query: req.query,
      timestamp: new Date().toISOString()
    };

    const analysis = analyzer.analyzeRequest(requestData);
    const { riskScore, threats, reasons } = analysis;

    let decision = 'allowed';
    let aiAnalysis = null;

    if (riskScore >= config.blockThreshold) {
      decision = 'blocked';
      analyzer.flagIP(requestData.ip);
    } else if (riskScore >= config.aiAnalysisThreshold) {
      decision = 'suspicious';
      if (config.aiEnabled) {
        aiAnalysis = await aiAnalyzer.analyzeRequest(requestData, riskScore, threats);
        if (aiAnalysis.recommendation === 'block' && aiAnalysis.confidence > 0.7) {
          decision = 'blocked';
          analyzer.flagIP(requestData.ip);
        }
      }
    }

    logger.logRequest(requestData, riskScore, decision, reasons.join('; '));
    metrics.recordRequest(decision, riskScore, req.path, threats);

    if (decision === 'blocked') {
      return res.status(403).json({
        error: 'Request blocked by security firewall',
        code: 'SENTINEL_BLOCKED',
        riskScore,
        threats,
        message: 'This request has been identified as potentially malicious and has been blocked.',
        timestamp: new Date().toISOString()
      });
    }

    res.setHeader('X-Sentinel-Risk-Score', riskScore);
    res.setHeader('X-Sentinel-Decision', decision);

    next();

  } catch (error) {
    console.error('Sentinel Middleware Error:', error);
    next();
  }
}

module.exports = sentinelMiddleware;
