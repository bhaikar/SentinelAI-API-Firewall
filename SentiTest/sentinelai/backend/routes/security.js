const express = require('express');
const logger = require('../utils/logger');
const metrics = require('../utils/metrics');

const router = express.Router();

/**
 * Get security dashboard metrics
 */
router.get('/dashboard', (req, res) => {
  res.json(metrics.getSummary());
});

/**
 * Get detailed metrics
 */
router.get('/metrics', (req, res) => {
  res.json(metrics.getMetrics());
});

/**
 * Get recent security logs
 */
router.get('/logs', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const type = req.query.type; // 'blocked', 'suspicious', 'allowed'

  const logs = type 
    ? logger.getLogsByType(type, limit)
    : logger.getRecentLogs(limit);

  res.json({
    total: logs.length,
    logs
  });
});

/**
 * Get blocked requests only
 */
router.get('/blocked', (req, res) => {
  const logs = logger.getLogsByType('blocked', 100);
  
  res.json({
    total: logs.length,
    blocked: logs
  });
});

/**
 * Get suspicious requests only
 */
router.get('/suspicious', (req, res) => {
  const logs = logger.getLogsByType('suspicious', 100);
  
  res.json({
    total: logs.length,
    suspicious: logs
  });
});

/**
 * Get top attacker IPs
 */
router.get('/top-ips', (req, res) => {
  const logger = require('../utils/logger');
  const logs = logger.getLogsByType('blocked', 1000);
  
  // Count blocked requests by IP
  const ipCounts = {};
  logs.forEach(log => {
    if (log.ip) {
      ipCounts[log.ip] = (ipCounts[log.ip] || 0) + 1;
    }
  });
  
  // Sort by count and return top 10
  const topIPs = Object.entries(ipCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([ip, blocked]) => ({ ip, blocked }));
  
  res.json(topIPs);
});

/**
 * Get security stats (compatible with frontend expectations)
 */
router.get('/stats', (req, res) => {
  const metricsData = metrics.getMetrics();
  const stats = {
    totalRequests: metricsData.totalRequests,
    blockedRequests: metricsData.blockedRequests,
    suspiciousRequests: metricsData.suspiciousRequests,
    allowedRequests: metricsData.allowedRequests,
    securityScore: metricsData.securityScore
  };
  res.json(stats);
});

/**
 * Reset metrics (useful for testing)
 */
router.post('/reset', (req, res) => {
  metrics.reset();
  logger.clearLogs();
  
  res.json({
    success: true,
    message: 'All security metrics and logs have been reset'
  });
});

/**
 * Get system status
 */
router.get('/status', (req, res) => {
  const config = require('../config/config');
  
  res.json({
    status: 'active',
    service: 'SentinelAI Firewall',
    version: '1.0.0',
    ai_enabled: config.aiEnabled,
    thresholds: {
      block: config.blockThreshold,
      ai_analysis: config.aiAnalysisThreshold
    },
    uptime: metrics.getMetrics().uptime
  });
});

module.exports = router;
