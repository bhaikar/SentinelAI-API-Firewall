/**
 * Threat Intelligence Module for real-time threat data integration
 */
class ThreatIntelligence {
  constructor() {
    this.maliciousIPs = new Set();
    this.maliciousDomains = new Set();
    this.threatSignatures = new Map();
    this.lastUpdate = 0;
    this.updateInProgress = false;
    
    // Initialize with some known threat patterns
    this.initializeThreatData();
  }

  /**
   * Check request against threat intelligence data
   */
  checkThreatIntelligence(requestData) {
    const result = {
      score: 0,
      reasons: [],
      threats: []
    };

    // 1. Check IP against malicious IP database
    const ipAnalysis = this.checkMaliciousIP(requestData.ip);
    result.score += ipAnalysis.score;
    result.reasons.push(...ipAnalysis.reasons);
    result.threats.push(...ipAnalysis.threats);

    // 2. Check for known attack patterns/signatures
    const signatureAnalysis = this.checkThreatSignatures(requestData);
    result.score += signatureAnalysis.score;
    result.reasons.push(...signatureAnalysis.reasons);
    result.threats.push(...signatureAnalysis.threats);

    // 3. Check headers for threat indicators
    const headerAnalysis = this.checkThreatHeaders(requestData.headers);
    result.score += headerAnalysis.score;
    result.reasons.push(...headerAnalysis.reasons);
    result.threats.push(...headerAnalysis.threats);

    // 4. Check for zero-day patterns
    const zeroDayAnalysis = this.checkZeroDayPatterns(requestData);
    result.score += zeroDayAnalysis.score;
    result.reasons.push(...zeroDayAnalysis.reasons);
    result.threats.push(...zeroDayAnalysis.threats);

    return result;
  }

  /**
   * Check if IP is in threat intelligence database
   */
  checkMaliciousIP(ip) {
    const result = { score: 0, reasons: [], threats: [] };

    // Direct IP match
    if (this.maliciousIPs.has(ip)) {
      result.score += 60;
      result.reasons.push('IP in threat intelligence database');
      result.threats.push('malicious_ip');
    }

    // Check IP ranges (CIDR notation would be better, but simplified for demo)
    const suspiciousRanges = [
      /^185\.220\./, // Known malicious range
      /^192\.42\.115\./, // Known exit nodes
      /^10\.0\.0\./, // Internal but suspicious if coming from external
    ];

    for (const range of suspiciousRanges) {
      if (range.test(ip)) {
        result.score += 30;
        result.reasons.push('IP in suspicious range');
        result.threats.push('suspicious_range');
        break;
      }
    }

    // TOR exit nodes (simplified check)
    if (this.isTorExitNode(ip)) {
      result.score += 20;
      result.reasons.push('TOR exit node detected');
      result.threats.push('tor_exit_node');
    }

    return result;
  }

  /**
   * Check request against known threat signatures
   */
  checkThreatSignatures(requestData) {
    const result = { score: 0, reasons: [], threats: [] };

    // Convert request to string for pattern matching
    const requestString = JSON.stringify({
      body: requestData.body,
      query: requestData.query,
      path: requestData.path,
      method: requestData.method
    }).toLowerCase();

    // Check against threat signatures
    for (const [signatureName, signature] of this.threatSignatures.entries()) {
      if (signature.pattern.test(requestString)) {
        result.score += signature.severity;
        result.reasons.push(signature.description);
        result.threats.push(signatureName);
      }
    }

    return result;
  }

  /**
   * Check headers for threat indicators
   */
  checkThreatHeaders(headers) {
    const result = { score: 0, reasons: [], threats: [] };

    if (!headers) return result;

    // Check for suspicious headers
    const suspiciousHeaders = {
      'x-forwarded-for': 'Multiple proxy detection',
      'x-real-ip': 'Proxy usage detection',
      'x-originating-ip': 'IP masking attempt',
      'via': 'Gateway/proxy detection'
    };

    for (const [header, description] of Object.entries(suspiciousHeaders)) {
      if (headers[header]) {
        const value = headers[header];
        
        // Check for multiple IPs in X-Forwarded-For
        if (header === 'x-forwarded-for' && value.split(',').length > 2) {
          result.score += 15;
          result.reasons.push(`${description}: ${value}`);
          result.threats.push('proxy_chain');
        }
      }
    }

    // Check for missing security headers in request (client-side)
    const expectedHeaders = ['accept', 'accept-language', 'accept-encoding'];
    const missingHeaders = expectedHeaders.filter(h => !headers[h]);
    
    if (missingHeaders.length > 1) {
      result.score += 10;
      result.reasons.push(`Missing expected headers: ${missingHeaders.join(', ')}`);
      result.threats.push('incomplete_headers');
    }

    return result;
  }

  /**
   * Check for zero-day or emerging threat patterns
   */
  checkZeroDayPatterns(requestData) {
    const result = { score: 0, reasons: [], threats: [] };

    // 1. Unusual parameter combinations
    if (requestData.body && this.hasUnusualParamCombination(requestData.body)) {
      result.score += 25;
      result.reasons.push('Unusual parameter combination detected');
      result.threats.push('unusual_params');
    }

    // 2. Encoding anomalies
    const encodingAnomalies = this.checkEncodingAnomalies(requestData);
    result.score += encodingAnomalies.score;
    result.reasons.push(...encodingAnomalies.reasons);
    result.threats.push(...encodingAnomalies.threats);

    // 3. Protocol violations
    const protocolViolations = this.checkProtocolViolations(requestData);
    result.score += protocolViolations.score;
    result.reasons.push(...protocolViolations.reasons);
    result.threats.push(...protocolViolations.threats);

    return result;
  }

  /**
   * Check for unusual parameter combinations
   */
  hasUnusualParamCombination(body) {
    if (!body || typeof body !== 'object') return false;

    const suspiciousCombinations = [
      // Admin parameters with user context
      ['admin', 'user_id'],
      // System commands with file operations
      ['exec', 'file'],
      // Database operations with file access
      ['query', 'path'],
      // Authentication bypass patterns
      ['token', 'bypass'],
      ['hash', 'crack']
    ];

    const bodyKeys = Object.keys(body).map(k => k.toLowerCase());

    for (const combination of suspiciousCombinations) {
      if (combination.every(param => bodyKeys.some(key => key.includes(param)))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check for encoding anomalies
   */
  checkEncodingAnomalies(requestData) {
    const result = { score: 0, reasons: [], threats: [] };

    const checkString = (str, context) => {
      if (typeof str !== 'string') return;

      // Multiple encoding layers
      if (str.includes('%25') && str.includes('%')) {
        result.score += 20;
        result.reasons.push(`Multiple encoding layers in ${context}`);
        result.threats.push('double_encoding');
      }

      // Unusual Unicode characters
      const unusualUnicode = /[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/;
      if (unusualUnicode.test(str)) {
        result.score += 15;
        result.reasons.push(`Control characters in ${context}`);
        result.threats.push('control_chars');
      }

      // Mixed encoding attempts
      if (str.includes('\\u') && str.includes('%')) {
        result.score += 18;
        result.reasons.push(`Mixed encoding in ${context}`);
        result.threats.push('mixed_encoding');
      }
    };

    // Check body
    if (requestData.body) {
      checkString(JSON.stringify(requestData.body), 'body');
    }

    // Check query parameters
    if (requestData.query) {
      checkString(JSON.stringify(requestData.query), 'query');
    }

    return result;
  }

  /**
   * Check for protocol violations
   */
  checkProtocolViolations(requestData) {
    const result = { score: 0, reasons: [], threats: [] };

    // Check HTTP method violations
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
    if (!validMethods.includes(requestData.method)) {
      result.score += 25;
      result.reasons.push(`Invalid HTTP method: ${requestData.method}`);
      result.threats.push('invalid_method');
    }

    // Check path traversal beyond normal patterns
    if (requestData.path.includes('../') || requestData.path.includes('..\\')) {
      result.score += 30;
      result.reasons.push('Path traversal attempt');
      result.threats.push('path_traversal');
    }

    // Check for HTTP version anomalies
    if (requestData.headers?.['http-version']) {
      const version = requestData.headers['http-version'];
      if (!/^HTTP\/[0-9]\.[0-9]$/.test(version)) {
        result.score += 15;
        result.reasons.push(`Invalid HTTP version: ${version}`);
        result.threats.push('invalid_http_version');
      }
    }

    return result;
  }

  /**
   * Check if IP is a TOR exit node (simplified)
   */
  isTorExitNode(ip) {
    // In production, this would integrate with TOR exit node lists
    // For demo, we'll use a simple pattern check
    const torPatterns = [
      /^185\.220\./,
      /^204\.8\.7\./,
      /^154\.35\./
    ];

    return torPatterns.some(pattern => pattern.test(ip));
  }

  /**
   * Initialize threat data with known patterns
   */
  initializeThreatData() {
    // Add some known malicious IPs (for demo)
    this.maliciousIPs.add('192.42.115.100');
    this.maliciousIPs.add('185.220.101.182');
    this.maliciousIPs.add('10.0.0.100'); // Internal but suspicious

    // Add threat signatures
    this.threatSignatures.set('log4j_exploit', {
      pattern: /\$\{jndi\:(ldap|rmi|dns|corba|cos|iiop)\:/i,
      severity: 50,
      description: 'Log4j JNDI injection attempt'
    });

    this.threatSignatures.set('spring4shell', {
      pattern: /class\.module\.classLoader/i,
      severity: 45,
      description: 'Spring4Shell exploitation attempt'
    });

    this.threatSignatures.set('struts_rce', {
      pattern: /\%{(#|\$)/,
      severity: 40,
      description: 'Struts2 OGNL injection attempt'
    });

    this.threatSignatures.set('webshell_upload', {
      pattern: /(eval|exec|system|shell_exec|passthru)\s*\(/i,
      severity: 35,
      description: 'Web shell upload attempt'
    });

    this.threatSignatures.set('xss_storage', {
      pattern: /<script[^>]*>.*<\/script>/gi,
      severity: 30,
      description: 'Stored XSS attempt'
    });

    this.threatSignatures.set('ldap_injection', {
      pattern: /(\(|\)|\*|\||&|\+)/,
      severity: 25,
      description: 'LDAP injection characters detected'
    });
  }

  /**
   * Update threat intelligence from external sources
   */
  async updateThreatFeeds() {
    if (this.updateInProgress) return;
    
    const now = Date.now();
    const updateInterval = 3600000; // 1 hour

    if (now - this.lastUpdate < updateInterval) {
      return;
    }

    this.updateInProgress = true;

    try {
      // In production, this would integrate with:
      // - VirusTotal API
      // - AbuseIPDB
      // - MISP (Malware Information Sharing Platform)
      // - Custom threat feeds
      
      console.log('🔄 Updating threat intelligence feeds...');
      
      // Simulate API calls
      await this.simulateThreatFeedUpdate();
      
      this.lastUpdate = now;
      console.log('✅ Threat intelligence updated successfully');
      
    } catch (error) {
      console.error('❌ Failed to update threat intelligence:', error.message);
    } finally {
      this.updateInProgress = false;
    }
  }

  /**
   * Simulate threat feed updates (for demo)
   */
  async simulateThreatFeedUpdate() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Add some new malicious IPs
    const newMaliciousIPs = [
      '192.42.115.101',
      '185.220.101.183',
      '154.35.20.1'
    ];

    newMaliciousIPs.forEach(ip => this.maliciousIPs.add(ip));

    // Add new threat signatures
    this.threatSignatures.set('cve_2024_latest', {
      pattern: /new_vulnerability_pattern/i,
      severity: 40,
      description: 'Latest CVE exploitation attempt'
    });

    console.log(`Added ${newMaliciousIPs.length} new malicious IPs`);
  }

  /**
   * Get threat intelligence statistics
   */
  getStats() {
    return {
      maliciousIPs: this.maliciousIPs.size,
      threatSignatures: this.threatSignatures.size,
      lastUpdate: this.lastUpdate,
      updateInProgress: this.updateInProgress
    };
  }

  /**
   * Clean up old threat data
   */
  cleanup() {
    // In production, this would clean up outdated threat data
    // For now, we'll just log the cleanup
    console.log('🧹 Threat intelligence cleanup completed');
  }
}

// Create singleton instance
const threatIntel = new ThreatIntelligence();

// Update threat feeds every hour
setInterval(() => threatIntel.updateThreatFeeds(), 3600000);

// Initial update
setTimeout(() => threatIntel.updateThreatFeeds(), 5000);

module.exports = threatIntel;
