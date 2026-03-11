const config = require('../config/config');
const advancedRateLimiter = require('./advancedRateLimiter');
const behaviorAnalyzer = require('./behaviorAnalyzer');
const threatIntel = require('./threatIntel');

class SecurityAnalyzer {
  constructor() {
    this.requestHistory = new Map();
    this.suspiciousIPs = new Map();
    this.escalationTracker = advancedRateLimiter.escalationTracker; // Reference to rate limiter's escalation tracker
  }

  /**
   * Analyze a request and calculate risk score
   */
  analyzeRequest(requestData) {
    const analysis = {
      riskScore: 0,
      threats: [],
      reasons: []
    };

    // Known safe endpoints — skip analysis entirely
    const safeEndpoints = ['/api/public', '/health'];
    if (safeEndpoints.some(ep => requestData.path.startsWith(ep))) {
      return analysis;
    }

    // 1. Endpoint Sensitivity Check
    const endpointRisk = this.analyzeEndpointSensitivity(requestData.path);
    analysis.riskScore += endpointRisk.score;
    if (endpointRisk.reason) analysis.reasons.push(endpointRisk.reason);

    // 2. HTTP Method Anomaly Detection
    const methodRisk = this.analyzeHTTPMethodAnomaly(requestData.method, requestData.path);
    analysis.riskScore += methodRisk.score;
    if (methodRisk.reason) analysis.reasons.push(methodRisk.reason);

    // 3. Parameter Anomaly Detection
    const paramRisk = this.analyzeParameterAnomalies(requestData.body, requestData.query, requestData.path);
    analysis.riskScore += paramRisk.score;
    analysis.reasons.push(...paramRisk.reasons);

    // 4. Payload Analysis
    if (requestData.body) {
      const payloadRisk = this.analyzePayload(requestData.body);
      analysis.riskScore += payloadRisk.score;
      analysis.threats.push(...payloadRisk.threats);
      analysis.reasons.push(...payloadRisk.reasons);
    }

    // 5. Query Parameters Analysis
    if (requestData.query) {
      const queryRisk = this.analyzeQueryParams(requestData.query);
      analysis.riskScore += queryRisk.score;
      analysis.threats.push(...queryRisk.threats);
      analysis.reasons.push(...queryRisk.reasons);
    }

    // 6. Headers Analysis
    const headerRisk = this.analyzeHeaders(requestData.headers);
    analysis.riskScore += headerRisk.score;
    analysis.reasons.push(...headerRisk.reasons);

    // 7. Advanced Rate Limiting Analysis
    const rateLimitRisk = advancedRateLimiter.checkRateLimits(requestData.ip, requestData.path);
    analysis.riskScore += rateLimitRisk.score;
    analysis.reasons.push(...rateLimitRisk.reasons);

    // 8. Request Frequency Analysis (legacy - kept for compatibility)
    const frequencyRisk = this.analyzeRequestFrequency(requestData.ip, requestData.path);
    analysis.riskScore += frequencyRisk.score;
    if (frequencyRisk.reason) analysis.reasons.push(frequencyRisk.reason);

    // 9. Enhanced IP Reputation Check
    const ipRisk = this.checkSuspiciousIP(requestData.ip);
    analysis.riskScore += ipRisk.score;
    if (ipRisk.reason) analysis.reasons.push(ipRisk.reason);

    // 10. Geographic and Behavioral IP Analysis
    const ipReputationRisk = this.analyzeIPReputation(requestData.ip);
    analysis.riskScore += ipReputationRisk.score;
    analysis.reasons.push(...ipReputationRisk.reasons);

    // 11. Behavior Analysis
    const behaviorAnalysis = behaviorAnalyzer.analyzeBehavior(requestData);
    analysis.riskScore += behaviorAnalysis.score;
    analysis.reasons.push(...behaviorAnalysis.reasons);
    analysis.threats.push(...behaviorAnalysis.threats);

    // 12. Threat Intelligence Analysis
    const threatAnalysis = threatIntel.checkThreatIntelligence(requestData);
    analysis.riskScore += threatAnalysis.score;
    analysis.reasons.push(...threatAnalysis.reasons);
    analysis.threats.push(...threatAnalysis.threats);

    // Cap risk score at max
    analysis.riskScore = Math.min(analysis.riskScore, config.maxRiskScore);

    return analysis;
  }

  /**
   * Analyze HTTP method anomalies
   */
  analyzeHTTPMethodAnomaly(method, path) {
    // Expected methods for common endpoint patterns
    const expectedMethods = {
      '/api/users': ['GET', 'POST', 'PUT', 'DELETE'],
      '/api/admin': ['GET', 'POST', 'PUT', 'DELETE'],
      '/api/auth/login': ['POST'],
      '/api/auth/register': ['POST'],
      '/api/payment/process': ['POST'],
      '/api/database/query': ['POST'],
      '/api/config': ['GET', 'POST'],
      '/api/public': ['GET', 'POST']
    };
    
    // Check for exact matches first
    for (const [pattern, methods] of Object.entries(expectedMethods)) {
      if (path.startsWith(pattern) && !methods.includes(method)) {
        return {
          score: 25,
          reason: `Unexpected HTTP method: ${method} for ${path} (expected: ${methods.join(', ')})`
        };
      }
    }
    
    // Check for suspicious method combinations
    if (method === 'DELETE' && !path.includes('/delete') && !path.includes('/admin')) {
      return {
        score: 20,
        reason: `DELETE method on non-deletion endpoint: ${path}`
      };
    }
    
    if (method === 'PATCH' && path.includes('/admin')) {
      return {
        score: 15,
        reason: `PATCH method on admin endpoint: ${path}`
      };
    }
    
    return { score: 0, reason: null };
  }

  /**
   * Analyze parameter anomalies
   */
  analyzeParameterAnomalies(body, query, path) {
    const result = {
      score: 0,
      reasons: []
    };
    
    // Analyze body parameters
    if (body) {
      // Check for negative amounts
      if (body.amount !== undefined && (typeof body.amount === 'number' && body.amount < 0)) {
        result.score += 20;
        result.reasons.push('Negative transaction amount detected');
      }
      
      // Check for invalid IDs
      if (body.id !== undefined && (isNaN(body.id) || body.id <= 0 || body.id === '')) {
        result.score += 15;
        result.reasons.push('Invalid ID parameter detected');
      }
      
      // Check for suspicious email patterns
      if (body.email && typeof body.email === 'string') {
        const suspiciousEmails = /[a-z0-9]+@[a-z0-9]+\.[a-z]{2,}/gi;
        if (!suspiciousEmails.test(body.email) || body.email.includes('..') || body.email.includes('..@')) {
          result.score += 10;
          result.reasons.push('Suspicious email format');
        }
      }
      
      // Check for extremely long string values
      for (const [key, value] of Object.entries(body)) {
        if (typeof value === 'string' && value.length > 5000) {
          result.score += 15;
          result.reasons.push(`Unusually long parameter: ${key}`);
          break;
        }
      }
      
      // Check for null/undefined critical fields — ONLY on auth routes
      const isAuthRoute = path && (path.includes('/auth') || path.includes('/login') || path.includes('/register'));
      if (isAuthRoute) {
        const criticalFields = ['username', 'password', 'email', 'token'];
        for (const field of criticalFields) {
          if (body[field] === null || body[field] === undefined || body[field] === '') {
            result.score += 5;
            result.reasons.push(`Missing critical field: ${field}`);
          }
        }
      }
    }
    
    // Analyze query parameters
    if (query) {
      // Check for SQL injection in query params (additional check)
      for (const [key, value] of Object.entries(query)) {
        if (typeof value === 'string') {
          const sqlPatterns = /(\bunion\b.*\bselect\b)|(\bdrop\b.*\btable\b)|(--)|(\b(and|or)\b\s*\d+\s*=\s*\d+)/gi;
          if (sqlPatterns.test(value)) {
            result.score += 25;
            result.reasons.push(`SQL injection pattern in query parameter: ${key}`);
          }
        }
      }
      
      // Check for excessive number of query parameters
      if (Object.keys(query).length > 20) {
        result.score += 10;
        result.reasons.push('Excessive number of query parameters');
      }
    }
    
    return result;
  }

  /**
   * Check endpoint sensitivity
   */
  analyzeEndpointSensitivity(path) {
    // Check for exact matches first
    for (const [pattern, score] of Object.entries(config.endpointSensitivity)) {
      if (pattern !== 'default' && path.startsWith(pattern)) {
        return {
          score,
          reason: `Sensitive endpoint: ${pattern}`
        };
      }
    }

    // Check for admin/sensitive keywords
    const sensitiveKeywords = ['admin', 'delete', 'destroy', 'drop', 'config', 'secret', 'key'];
    for (const keyword of sensitiveKeywords) {
      if (path.toLowerCase().includes(keyword)) {
        return {
          score: 25,
          reason: `Sensitive keyword in path: ${keyword}`
        };
      }
    }

    return {
      score: config.endpointSensitivity.default,
      reason: null
    };
  }

  /**
   * Analyze payload for malicious patterns
   */
  analyzePayload(payload) {
    const result = {
      score: 0,
      threats: [],
      reasons: []
    };

    const payloadString = JSON.stringify(payload).toLowerCase();

    // SQL Injection Detection
    const sqlMatches = this.detectPattern(payloadString, config.suspiciousPatterns.sqlInjection);
    if (sqlMatches.length > 0) {
      result.score += 40;
      result.threats.push('sql_injection');
      result.reasons.push(`SQL injection patterns detected: ${sqlMatches.join(', ')}`);
    }

    // XSS Detection
    const xssMatches = this.detectPattern(payloadString, config.suspiciousPatterns.xss);
    if (xssMatches.length > 0) {
      result.score += 35;
      result.threats.push('xss');
      result.reasons.push(`XSS patterns detected: ${xssMatches.join(', ')}`);
    }

    // Path Traversal Detection
    const pathMatches = this.detectPattern(payloadString, config.suspiciousPatterns.pathTraversal);
    if (pathMatches.length > 0) {
      result.score += 30;
      result.threats.push('path_traversal');
      result.reasons.push('Path traversal attempt detected');
    }

    // Command Injection Detection
    const cmdMatches = this.detectPattern(payloadString, config.suspiciousPatterns.commandInjection);
    if (cmdMatches.length > 0) {
      result.score += 35;
      result.threats.push('command_injection');
      result.reasons.push('Command injection patterns detected');
    }

    // Check for excessively long values
    if (payloadString.length > 10000) {
      result.score += 15;
      result.reasons.push('Unusually large payload size');
    }

    return result;
  }

  /**
   * Analyze query parameters
   */
  analyzeQueryParams(query) {
    const result = {
      score: 0,
      threats: [],
      reasons: []
    };

    const queryString = JSON.stringify(query).toLowerCase();

    // Check for injection patterns
    const sqlMatches = this.detectPattern(queryString, config.suspiciousPatterns.sqlInjection);
    if (sqlMatches.length > 0) {
      result.score += 35;
      result.threats.push('sql_injection');
      result.reasons.push('SQL injection in query parameters');
    }

    const xssMatches = this.detectPattern(queryString, config.suspiciousPatterns.xss);
    if (xssMatches.length > 0) {
      result.score += 30;
      result.threats.push('xss');
      result.reasons.push('XSS in query parameters');
    }

    return result;
  }

  /**
   * Analyze request headers
   */
  analyzeHeaders(headers) {
    const result = {
      score: 0,
      reasons: []
    };

    // Check for missing or suspicious User-Agent
    if (!headers['user-agent']) {
      result.score += 10;
      result.reasons.push('Missing User-Agent header');
    } else if (headers['user-agent'].toLowerCase().includes('curl') || 
               headers['user-agent'].toLowerCase().includes('wget')) {
      result.score += 5;
      result.reasons.push('Automated tool detected');
    }

    // Check for suspicious referer
    if (headers['referer'] && headers['referer'].includes('malicious')) {
      result.score += 15;
      result.reasons.push('Suspicious referer');
    }

    return result;
  }

  /**
   * Analyze request frequency from same IP
   */
  analyzeRequestFrequency(ip, path) {
    const now = Date.now();
    const key = `${ip}:${path}`;

    if (!this.requestHistory.has(key)) {
      this.requestHistory.set(key, []);
    }

    const history = this.requestHistory.get(key);
    
    // Remove requests older than 60 seconds
    const recentRequests = history.filter(timestamp => now - timestamp < 60000);
    recentRequests.push(now);
    this.requestHistory.set(key, recentRequests);

    // Check for rate limiting violations
    if (recentRequests.length > 50) {
      return {
        score: 30,
        reason: `Excessive requests: ${recentRequests.length} requests in 60 seconds`
      };
    } else if (recentRequests.length > 30) {
      return {
        score: 15,
        reason: `High request rate: ${recentRequests.length} requests in 60 seconds`
      };
    }

    return { score: 0, reason: null };
  }

  /**
   * Enhanced IP Reputation Analysis
   */
  analyzeIPReputation(ip) {
    const result = {
      score: 0,
      reasons: []
    };

    // 1. Check escalation level from rate limiter
    const escalationData = this.escalationTracker?.get(ip);
    if (escalationData && escalationData.level > 0) {
      result.score += escalationData.level * 10;
      result.reasons.push(`IP escalation level: ${escalationData.level}`);
    }

    // 2. Geographic analysis (placeholder for GeoIP integration)
    const geoRisk = this.analyzeGeography(ip);
    result.score += geoRisk.score;
    if (geoRisk.reason) result.reasons.push(geoRisk.reason);

    // 3. Check if IP is in private ranges
    if (this.isPrivateIP(ip)) {
      // Private IPs are generally less suspicious but can indicate internal threats
      result.score += 5;
      result.reasons.push('Private IP address');
    }

    // 4. Check for known malicious patterns
    if (this.isSuspiciousIPPattern(ip)) {
      result.score += 25;
      result.reasons.push('Suspicious IP pattern detected');
    }

    // 5. Check IP reputation history
    const ipHistory = this.suspiciousIPs.get(ip);
    if (ipHistory) {
      const daysSinceFirst = (Date.now() - ipHistory.firstSeen) / (1000 * 60 * 60 * 24);
      const violationRate = ipHistory.count / daysSinceFirst;
      
      if (violationRate > 5) { // More than 5 violations per day
        result.score += 30;
        result.reasons.push(`High violation rate: ${violationRate.toFixed(1)}/day`);
      }
    }

    return result;
  }

  /**
   * Analyze geographic location (placeholder for GeoIP integration)
   */
  analyzeGeography(ip) {
    // This is a placeholder - in production you'd use a GeoIP database
    // like GeoIP2, MaxMind, or an API service
    
    const result = { score: 0, reason: null };

    // Example geographic risk factors (would be implemented with real GeoIP data)
    const highRiskCountries = ['CN', 'RU', 'KP', 'IR'];
    const mediumRiskCountries = ['BR', 'IN', 'PK', 'BD'];
    
    // For demo purposes, we'll do some basic IP-based heuristics
    // In production, replace with actual GeoIP lookup
    
    // Check for common VPN/proxy exit points (simplified)
    if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.')) {
      // Private ranges - already handled in main function
    } else if (ip.startsWith('127.') || ip === '::1') {
      // localhost
      result.score = 0;
    } else {
      // Public IP - would check country in real implementation
      // For now, we'll add a small risk score for unknown public IPs
      result.score = 2;
      result.reason = 'Public IP (geographic analysis not implemented)';
    }

    return result;
  }

  /**
   * Check if IP is in private ranges
   */
  isPrivateIP(ip) {
    // IPv4 private ranges
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^127\./,
      /^169\.254\./, // Link-local
      /^::1$/, // IPv6 localhost
      /^fc00:/, // IPv6 private
      /^fe80:/  // IPv6 link-local
    ];

    return privateRanges.some(range => range.test(ip));
  }

  /**
   * Check for suspicious IP patterns
   */
  isSuspiciousIPPattern(ip) {
    // Check for patterns commonly associated with attacks
    const suspiciousPatterns = [
      /^0\./, // Source-routed addresses
      /^255\./, // Broadcast addresses
      /^224\./, // Multicast addresses
      /^169\.254\./ // Link-local (can be suspicious in certain contexts)
    ];

    return suspiciousPatterns.some(pattern => pattern.test(ip));
  }

  /**
   * Check if IP has been previously flagged
   */
  checkSuspiciousIP(ip) {
    if (this.suspiciousIPs.has(ip)) {
      const data = this.suspiciousIPs.get(ip);
      const minutesSinceLastSeen = (Date.now() - data.lastSeen) / 60000;

      // Decay: if no incidents in the last 5 minutes, clear the flag
      if (minutesSinceLastSeen > 5) {
        this.suspiciousIPs.delete(ip);
        return { score: 0, reason: null };
      }

      // Scale score by incident count but cap at 15
      const score = Math.min(data.count * 3, 15);
      return {
        score,
        reason: `Previously flagged IP (${data.count} incidents, ${minutesSinceLastSeen.toFixed(1)}m ago)`
      };
    }

    return { score: 0, reason: null };
  }

  /**
   * Mark an IP as suspicious
   */
  flagIP(ip) {
    const data = this.suspiciousIPs.get(ip) || { count: 0, firstSeen: Date.now() };
    data.count++;
    data.lastSeen = Date.now();
    this.suspiciousIPs.set(ip, data);
  }

  /**
   * Detect patterns in text
   */
  detectPattern(text, patterns) {
    const matches = [];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        matches.push(match[0].substring(0, 30)); // Limit length
      }
    }

    return matches;
  }

  /**
   * Clean up old data periodically
   */
  cleanup() {
    const now = Date.now();
    const maxAge = 3600000; // 1 hour

    // Clean request history
    for (const [key, timestamps] of this.requestHistory.entries()) {
      const recent = timestamps.filter(t => now - t < maxAge);
      if (recent.length === 0) {
        this.requestHistory.delete(key);
      } else {
        this.requestHistory.set(key, recent);
      }
    }

    // Clean suspicious IPs (after 24 hours)
    for (const [ip, data] of this.suspiciousIPs.entries()) {
      if (now - data.lastSeen > 86400000) {
        this.suspiciousIPs.delete(ip);
      }
    }
  }
}

// Run cleanup every 10 minutes
const analyzer = new SecurityAnalyzer();
setInterval(() => analyzer.cleanup(), 600000);

module.exports = analyzer;
