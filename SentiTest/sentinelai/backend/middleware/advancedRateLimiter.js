const config = require('../config/config');

/**
 * Advanced Rate Limiter with multiple time windows and progressive penalties
 */
class AdvancedRateLimiter {
  constructor() {
    this.ipWindows = new Map(); // IP -> { timestamps: number[], escalation: { count, level, lastReset } }
    this.globalWindows = new Map(); // Global rate limiting
    this.endpointWindows = new Map(); // Per-endpoint rate limiting
    this.escalationTracker = new Map(); // IP -> escalation data
  }

  /**
   * Check rate limits across multiple time windows
   */
  checkRateLimits(ip, path) {
    const result = {
      score: 0,
      reasons: [],
      blocked: false
    };

    // 1. Check multiple time windows for this IP
    const multiWindowResult = this.checkMultipleWindows(ip);
    result.score += multiWindowResult.score;
    result.reasons.push(...multiWindowResult.reasons);

    // 2. Check progressive escalation
    const escalationResult = this.checkEscalation(ip);
    result.score += escalationResult.score;
    result.reasons.push(...escalationResult.reasons);

    // 3. Check endpoint-specific rate limits
    const endpointResult = this.checkEndpointLimits(ip, path);
    result.score += endpointResult.score;
    result.reasons.push(...endpointResult.reasons);

    // 4. Check burst detection
    const burstResult = this.checkBurstDetection(ip);
    result.score += burstResult.score;
    result.reasons.push(...burstResult.reasons);

    // 5. Check global rate limits
    const globalResult = this.checkGlobalLimits();
    result.score += globalResult.score;
    result.reasons.push(...globalResult.reasons);

    // Update request tracking
    this.trackRequest(ip, path);

    return result;
  }

  /**
   * Check multiple time windows (10s, 1min, 10min, 1hour)
   */
  checkMultipleWindows(ip) {
    const result = { score: 0, reasons: [] };
    const now = Date.now();
    
    if (!this.ipWindows.has(ip)) {
      this.ipWindows.set(ip, { timestamps: [] });
    }

    const timestamps = this.ipWindows.get(ip).timestamps;
    
    // Define time windows with increasing strictness
    const windows = [
      { duration: 10000, maxRequests: 15, score: 25, name: '10 seconds' },
      { duration: 60000, maxRequests: 60, score: 35, name: '1 minute' },
      { duration: 600000, maxRequests: 300, score: 45, name: '10 minutes' },
      { duration: 3600000, maxRequests: 1000, score: 60, name: '1 hour' }
    ];

    for (const window of windows) {
      const windowStart = now - window.duration;
      const requestsInWindow = timestamps.filter(timestamp => timestamp >= windowStart);
      
      if (requestsInWindow.length > window.maxRequests) {
        const excess = requestsInWindow.length - window.maxRequests;
        result.score += window.score;
        result.reasons.push(`Rate limit exceeded: ${requestsInWindow.length} requests in ${window.name} (limit: ${window.maxRequests})`);
        
        // Mark for escalation if significantly over limit
        if (excess > window.maxRequests * 0.5) {
          this.markForEscalation(ip, 'severe');
        }
      }
    }

    return result;
  }

  /**
   * Check progressive escalation penalties
   */
  checkEscalation(ip) {
    const result = { score: 0, reasons: [] };
    
    if (!this.escalationTracker.has(ip)) {
      return result;
    }

    const escalation = this.escalationTracker.get(ip);
    const now = Date.now();
    
    // Reset escalation level if enough time has passed
    if (now - escalation.lastViolation > 3600000) { // 1 hour cooldown
      escalation.level = Math.max(0, escalation.level - 1);
      escalation.violationCount = 0;
    }

    // Apply escalating penalties
    if (escalation.level >= 1) {
      const penaltyScores = [0, 15, 30, 50, 70]; // Level 0-4 penalties
      result.score += penaltyScores[escalation.level] || 70;
      result.reasons.push(`IP escalation level: ${escalation.level} (${escalation.violationCount} violations)`);
    }

    return result;
  }

  /**
   * Check endpoint-specific rate limits
   */
  checkEndpointLimits(ip, path) {
    const result = { score: 0, reasons: [] };
    const key = `${ip}:${path}`;
    const now = Date.now();
    
    if (!this.endpointWindows.has(key)) {
      this.endpointWindows.set(key, { timestamps: [] });
    }

    const timestamps = this.endpointWindows.get(key).timestamps;
    const recentRequests = timestamps.filter(timestamp => now - timestamp < 60000); // 1 minute

    // Different limits for different endpoint types
    let limit = 30; // Default limit
    if (path.includes('/auth/')) limit = 10; // Auth endpoints are more sensitive
    if (path.includes('/admin/')) limit = 20; // Admin endpoints
    if (path.includes('/payment/')) limit = 15; // Payment endpoints
    if (path.includes('/public/')) limit = 100; // Public endpoints are more lenient

    if (recentRequests.length > limit) {
      result.score += 25;
      result.reasons.push(`Endpoint rate limit exceeded: ${recentRequests.length} requests to ${path} (limit: ${limit}/min)`);
    }

    return result;
  }

  /**
   * Check for burst patterns (many requests in very short time)
   */
  checkBurstDetection(ip) {
    const result = { score: 0, reasons: [] };
    
    if (!this.ipWindows.has(ip)) {
      return result;
    }

    const timestamps = this.ipWindows.get(ip).timestamps;
    const now = Date.now();
    
    // Check for bursts in last 5 seconds
    const recentBurst = timestamps.filter(timestamp => now - timestamp < 5000);
    
    if (recentBurst.length > 10) {
      result.score += 30;
      result.reasons.push(`Burst detected: ${recentBurst.length} requests in 5 seconds`);
    }
    
    // Check for micro-bursts (1 second)
    const microBurst = timestamps.filter(timestamp => now - timestamp < 1000);
    if (microBurst.length > 5) {
      result.score += 35;
      result.reasons.push(`Micro-burst detected: ${microBurst.length} requests in 1 second`);
    }

    return result;
  }

  /**
   * Check global rate limits (across all IPs)
   */
  checkGlobalLimits() {
    const result = { score: 0, reasons: [] };
    const now = Date.now();
    
    if (!this.globalWindows.has('all')) {
      this.globalWindows.set('all', { timestamps: [] });
    }

    const timestamps = this.globalWindows.get('all').timestamps;
    const recentGlobal = timestamps.filter(timestamp => now - timestamp < 60000); // 1 minute

    // Global limit to prevent system overload
    if (recentGlobal.length > 5000) {
      result.score += 20;
      result.reasons.push(`High global traffic: ${recentGlobal.length} requests in last minute`);
    }

    return result;
  }

  /**
   * Track a new request
   */
  trackRequest(ip, path) {
    const now = Date.now();
    
    // Update IP tracking
    if (!this.ipWindows.has(ip)) {
      this.ipWindows.set(ip, { timestamps: [] });
    }
    this.ipWindows.get(ip).timestamps.push(now);

    // Update endpoint tracking
    const key = `${ip}:${path}`;
    if (!this.endpointWindows.has(key)) {
      this.endpointWindows.set(key, { timestamps: [] });
    }
    this.endpointWindows.get(key).timestamps.push(now);

    // Update global tracking
    if (!this.globalWindows.has('all')) {
      this.globalWindows.set('all', { timestamps: [] });
    }
    this.globalWindows.get('all').timestamps.push(now);
  }

  /**
   * Mark IP for escalation
   */
  markForEscalation(ip, severity = 'normal') {
    if (!this.escalationTracker.has(ip)) {
      this.escalationTracker.set(ip, {
        level: 0,
        violationCount: 0,
        lastViolation: 0,
        firstViolation: Date.now()
      });
    }

    const escalation = this.escalationTracker.get(ip);
    escalation.violationCount++;
    escalation.lastViolation = Date.now();

    // Increase escalation level based on severity and violation count
    if (severity === 'severe' || escalation.violationCount > 5) {
      escalation.level = Math.min(escalation.level + 1, 4); // Max level 4
    } else if (escalation.violationCount > 2) {
      escalation.level = Math.min(escalation.level + 1, 3);
    }
  }

  /**
   * Clean up old data
   */
  cleanup() {
    const now = Date.now();
    const maxAge = 3600000; // 1 hour

    // Clean IP windows
    for (const [ip, data] of this.ipWindows.entries()) {
      const recent = data.timestamps.filter(t => now - t < maxAge);
      if (recent.length === 0) {
        this.ipWindows.delete(ip);
      } else {
        this.ipWindows.set(ip, { timestamps: recent });
      }
    }

    // Clean endpoint windows
    for (const [key, data] of this.endpointWindows.entries()) {
      const recent = data.timestamps.filter(t => now - t < maxAge);
      if (recent.length === 0) {
        this.endpointWindows.delete(key);
      } else {
        this.endpointWindows.set(key, { timestamps: recent });
      }
    }

    // Clean global windows
    for (const [key, data] of this.globalWindows.entries()) {
      const recent = data.timestamps.filter(t => now - t < maxAge);
      this.globalWindows.set(key, { timestamps: recent });
    }

    // Clean escalation tracker (remove old entries)
    for (const [ip, data] of this.escalationTracker.entries()) {
      if (now - data.lastViolation > 86400000) { // 24 hours
        this.escalationTracker.delete(ip);
      }
    }
  }

  /**
   * Get rate limit statistics
   */
  getStats() {
    const stats = {
      trackedIPs: this.ipWindows.size,
      trackedEndpoints: this.endpointWindows.size,
      escalatedIPs: this.escalationTracker.size,
      globalRequests: this.globalWindows.get('all')?.timestamps?.length || 0
    };

    // Count escalation levels
    const escalationLevels = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const data of this.escalationTracker.values()) {
      escalationLevels[data.level]++;
    }
    stats.escalationLevels = escalationLevels;

    return stats;
  }
}

// Create singleton instance
const rateLimiter = new AdvancedRateLimiter();

// Run cleanup every 5 minutes
setInterval(() => rateLimiter.cleanup(), 300000);

module.exports = rateLimiter;
