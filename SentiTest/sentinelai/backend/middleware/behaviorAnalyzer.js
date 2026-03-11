/**
 * Behavior Analyzer for detecting bot-like and anomalous user behavior patterns
 */
class BehaviorAnalyzer {
  constructor() {
    this.sessionTracker = new Map(); // sessionKey -> session data
    this.baselineMetrics = new Map(); // endpoint -> baseline data
    this.userJourneyTracker = new Map(); // ip -> journey data
    this.timingPatterns = new Map(); // ip -> timing data
  }

  /**
   * Analyze request behavior and return risk assessment
   */
  analyzeBehavior(requestData) {
    const result = {
      score: 0,
      reasons: [],
      threats: []
    };

    // 1. Session tracking and analysis
    const sessionAnalysis = this.trackSession(requestData.ip, requestData.userAgent, requestData.path);
    result.score += sessionAnalysis.score;
    result.reasons.push(...sessionAnalysis.reasons);
    result.threats.push(...sessionAnalysis.threats);

    // 2. Bot behavior detection
    const botAnalysis = this.detectBotBehavior(requestData);
    result.score += botAnalysis.score;
    result.reasons.push(...botAnalysis.reasons);
    result.threats.push(...botAnalysis.threats);

    // 3. User journey analysis
    const journeyAnalysis = this.analyzeUserJourney(requestData);
    result.score += journeyAnalysis.score;
    result.reasons.push(...journeyAnalysis.reasons);

    // 4. Timing pattern analysis
    const timingAnalysis = this.analyzeTimingPatterns(requestData);
    result.score += timingAnalysis.score;
    result.reasons.push(...timingAnalysis.reasons);

    // 5. Baseline deviation analysis
    const baselineAnalysis = this.analyzeBaselineDeviation(requestData);
    result.score += baselineAnalysis.score;
    result.reasons.push(...baselineAnalysis.reasons);

    return result;
  }

  /**
   * Track user session and analyze session behavior
   */
  trackSession(ip, userAgent, path) {
    const result = { score: 0, reasons: [], threats: [] };
    const now = Date.now();
    
    // Create session key based on IP and User-Agent
    const sessionKey = `${ip}:${userAgent || 'unknown'}`;
    
    if (!this.sessionTracker.has(sessionKey)) {
      this.sessionTracker.set(sessionKey, {
        startTime: now,
        requestCount: 0,
        endpoints: new Set(),
        lastRequest: now,
        patterns: {
          methodDistribution: {},
          pathFrequency: {},
          hourlyDistribution: new Array(24).fill(0)
        }
      });
    }

    const session = this.sessionTracker.get(sessionKey);
    session.requestCount++;
    session.endpoints.add(path);
    session.lastRequest = now;

    // Calculate session duration
    const sessionDuration = now - session.startTime;
    const requestRate = session.requestCount / (sessionDuration / 1000 / 60); // requests per minute

    // Detect suspicious session patterns
    if (requestRate > 100) { // More than 100 requests per minute
      result.score += 30;
      result.reasons.push(`High request rate: ${requestRate.toFixed(1)} req/min`);
      result.threats.push('high_frequency_session');
    }

    if (session.endpoints.size === 1 && session.requestCount > 50) {
      result.score += 25;
      result.reasons.push(`Single endpoint repetitive access: ${path} (${session.requestCount} requests)`);
      result.threats.push('repetitive_behavior');
    }

    // Check for session age vs request count
    if (sessionDuration < 60000 && session.requestCount > 200) { // Many requests in first minute
      result.score += 35;
      result.reasons.push(`Burst activity: ${session.requestCount} requests in first minute`);
      result.threats.push('burst_session');
    }

    // Update hourly distribution
    const hour = new Date(now).getHours();
    session.patterns.hourlyDistribution[hour]++;

    return result;
  }

  /**
   * Detect bot-like behavior patterns
   */
  detectBotBehavior(requestData) {
    const result = { score: 0, reasons: [], threats: [] };
    
    // 1. User-Agent analysis
    const ua = requestData.userAgent || 'unknown';
    const botPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i,
      /curl/i, /wget/i, /python/i, /java/i,
      /postman/i, /insomnia/i, /httpie/i
    ];

    const isBotUA = botPatterns.some(pattern => pattern.test(ua));
    if (isBotUA) {
      result.score += 20;
      result.reasons.push('Bot or automation tool detected in User-Agent');
      result.threats.push('bot_user_agent');
    }

    // 2. Missing or generic User-Agent
    if (ua === 'unknown' || ua.length < 10) {
      result.score += 15;
      result.reasons.push('Missing or suspicious User-Agent');
      result.threats.push('missing_user_agent');
    }

    // 3. Perfect timing patterns (bots are too regular)
    const timingKey = requestData.ip;
    if (!this.timingPatterns.has(timingKey)) {
      this.timingPatterns.set(timingKey, []);
    }
    
    const timingData = this.timingPatterns.get(timingKey);
    timingData.push(Date.now());
    
    // Keep only last 20 timestamps
    if (timingData.length > 20) {
      timingData.shift();
    }

    // Check for regular intervals (sign of automation)
    if (timingData.length >= 5) {
      const intervals = [];
      for (let i = 1; i < timingData.length; i++) {
        intervals.push(timingData[i] - timingData[i-1]);
      }
      
      // Calculate variance in intervals
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
      
      // Low variance indicates automated behavior
      if (variance < 100) { // Very low variance
        result.score += 25;
        result.reasons.push('Highly regular request intervals (automation suspected)');
        result.threats.push('regular_timing');
      }
    }

    // 4. Header analysis for bot indicators
    const headers = requestData.headers || {};
    if (!headers['accept'] || !headers['accept-language']) {
      result.score += 10;
      result.reasons.push('Missing common browser headers');
    }

    if (headers['x-forwarded-for'] && headers['x-forwarded-for'].split(',').length > 3) {
      result.score += 15;
      result.reasons.push('Multiple proxy hops detected');
      result.threats.push('proxy_chain');
    }

    return result;
  }

  /**
   * Analyze user journey patterns
   */
  analyzeUserJourney(requestData) {
    const result = { score: 0, reasons: [] };
    const ip = requestData.ip;
    const now = Date.now();
    
    if (!this.userJourneyTracker.has(ip)) {
      this.userJourneyTracker.set(ip, {
        requests: [],
        firstRequest: now,
        uniqueEndpoints: new Set()
      });
    }

    const journey = this.userJourneyTracker.get(ip);
    journey.requests.push({
      path: requestData.path,
      method: requestData.method,
      timestamp: now
    });
    journey.uniqueEndpoints.add(requestData.path);

    // Keep only last 100 requests
    if (journey.requests.length > 100) {
      journey.requests.shift();
    }

    // Analyze journey patterns
    const recentRequests = journey.requests.slice(-20); // Last 20 requests
    
    // 1. Check for logical flow violations
    if (this.isLogicalFlowViolation(recentRequests)) {
      result.score += 20;
      result.reasons.push('Illogical request sequence detected');
    }

    // 2. Check for endpoint hopping (potential reconnaissance)
    if (journey.uniqueEndpoints.size > 15 && journey.requests.length < 30) {
      result.score += 15;
      result.reasons.push('Rapid endpoint exploration (reconnaissance pattern)');
    }

    // 3. Check for missing authentication flow
    if (this.skippedAuthFlow(recentRequests)) {
      result.score += 25;
      result.reasons.push('Access to protected endpoints without authentication');
    }

    return result;
  }

  /**
   * Analyze timing patterns for suspicious behavior
   */
  analyzeTimingPatterns(requestData) {
    const result = { score: 0, reasons: [] };
    const ip = requestData.ip;
    const now = Date.now();
    
    // Time-based attack patterns
    const hour = new Date(now).getHours();
    
    // Suspicious activity during off-hours (2-6 AM)
    if (hour >= 2 && hour <= 6) {
      result.score += 10;
      result.reasons.push('Activity during unusual hours (2-6 AM)');
    }

    // Weekend activity on business endpoints
    const dayOfWeek = new Date(now).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
      if (requestData.path.includes('/admin/') || requestData.path.includes('/payment/')) {
        result.score += 15;
        result.reasons.push('Weekend activity on business-critical endpoints');
      }
    }

    return result;
  }

  /**
   * Analyze deviations from established baselines
   */
  analyzeBaselineDeviation(requestData) {
    const result = { score: 0, reasons: [] };
    const endpoint = requestData.path;
    
    // Establish baseline for this endpoint if not exists
    if (!this.baselineMetrics.has(endpoint)) {
      this.baselineMetrics.set(endpoint, {
        totalRequests: 0,
        uniqueIPs: new Set(),
        methods: new Set(),
        avgPayloadSize: 0,
        hourlyDistribution: new Array(24).fill(0)
      });
    }

    const baseline = this.baselineMetrics.get(endpoint);
    baseline.totalRequests++;
    baseline.uniqueIPs.add(requestData.ip);
    baseline.methods.add(requestData.method);

    // Update payload size baseline
    const payloadSize = JSON.stringify(requestData.body || {}).length;
    baseline.avgPayloadSize = (baseline.avgPayloadSize * (baseline.totalRequests - 1) + payloadSize) / baseline.totalRequests;

    // Check for deviations
    if (baseline.totalRequests > 10) {
      // Payload size anomaly
      if (payloadSize > baseline.avgPayloadSize * 10) {
        result.score += 15;
        result.reasons.push(`Unusually large payload for ${endpoint}`);
      }

      // Method anomaly
      const commonMethods = ['GET', 'POST', 'PUT', 'DELETE'];
      if (!commonMethods.includes(requestData.method)) {
        result.score += 10;
        result.reasons.push(`Unusual HTTP method: ${requestData.method}`);
      }
    }

    return result;
  }

  /**
   * Check if request sequence violates logical flow
   */
  isLogicalFlowViolation(requests) {
    if (requests.length < 3) return false;

    // Check for accessing protected endpoints without auth
    const hasAuth = requests.some(req => 
      req.path.includes('/auth/login') || req.path.includes('/auth/register')
    );

    const hasProtectedAccess = requests.some(req =>
      req.path.includes('/admin/') || req.path.includes('/payment/')
    );

    return hasProtectedAccess && !hasAuth;
  }

  /**
   * Check if authentication flow was skipped
   */
  skippedAuthFlow(requests) {
    const protectedEndpoints = requests.filter(req =>
      req.path.includes('/admin/') || req.path.includes('/payment/') || req.path.includes('/user/')
    );

    const authEndpoints = requests.filter(req =>
      req.path.includes('/auth/')
    );

    return protectedEndpoints.length > 0 && authEndpoints.length === 0;
  }

  /**
   * Clean up old data
   */
  cleanup() {
    const now = Date.now();
    const maxAge = 86400000; // 24 hours

    // Clean session tracker
    for (const [key, session] of this.sessionTracker.entries()) {
      if (now - session.lastRequest > maxAge) {
        this.sessionTracker.delete(key);
      }
    }

    // Clean user journey tracker
    for (const [ip, journey] of this.userJourneyTracker.entries()) {
      if (now - journey.firstRequest > maxAge) {
        this.userJourneyTracker.delete(ip);
      }
    }

    // Clean timing patterns
    for (const [ip, timings] of this.timingPatterns.entries()) {
      const recent = timings.filter(t => now - t < maxAge);
      if (recent.length === 0) {
        this.timingPatterns.delete(ip);
      } else {
        this.timingPatterns.set(ip, recent);
      }
    }
  }

  /**
   * Get behavior analysis statistics
   */
  getStats() {
    return {
      activeSessions: this.sessionTracker.size,
      trackedJourneys: this.userJourneyTracker.size,
      timingPatterns: this.timingPatterns.size,
      baselineEndpoints: this.baselineMetrics.size
    };
  }
}

// Create singleton instance
const behaviorAnalyzer = new BehaviorAnalyzer();

// Run cleanup every 30 minutes
setInterval(() => behaviorAnalyzer.cleanup(), 1800000);

module.exports = behaviorAnalyzer;
