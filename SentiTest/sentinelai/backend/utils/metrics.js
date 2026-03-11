const logger = require('./logger');

class SecurityMetrics {
  constructor() {
    this.reset();
  }

  reset() {
    this.totalRequests = 0;
    this.allowedRequests = 0;
    this.suspiciousRequests = 0;
    this.blockedRequests = 0;
    this.threatsByType = {};
    this.endpointStats = {};
    this.startTime = new Date();
  }

  recordRequest(decision, riskScore, path, threatTypes = []) {
    this.totalRequests++;

    switch(decision) {
      case 'allowed':
        this.allowedRequests++;
        break;
      case 'suspicious':
        this.suspiciousRequests++;
        break;
      case 'blocked':
        this.blockedRequests++;
        break;
    }

    // Track threat types
    threatTypes.forEach(type => {
      this.threatsByType[type] = (this.threatsByType[type] || 0) + 1;
    });

    // Track endpoint stats
    if (!this.endpointStats[path]) {
      this.endpointStats[path] = {
        total: 0,
        blocked: 0,
        suspicious: 0,
        averageRisk: 0
      };
    }

    const stat = this.endpointStats[path];
    stat.total++;
    if (decision === 'blocked') stat.blocked++;
    if (decision === 'suspicious') stat.suspicious++;
    stat.averageRisk = ((stat.averageRisk * (stat.total - 1)) + riskScore) / stat.total;
  }

  getSecurityScore() {
    if (this.totalRequests === 0) return 100;
    
    const threatPercentage = ((this.blockedRequests + this.suspiciousRequests) / this.totalRequests) * 100;
    const score = Math.max(0, 100 - threatPercentage * 2);
    return Math.round(score);
  }

  getMetrics() {
    return {
      totalRequests: this.totalRequests,
      allowedRequests: this.allowedRequests,
      suspiciousRequests: this.suspiciousRequests,
      blockedRequests: this.blockedRequests,
      securityScore: this.getSecurityScore(),
      threatsByType: this.threatsByType,
      topThreats: this.getTopThreats(),
      vulnerableEndpoints: this.getVulnerableEndpoints(),
      uptime: Math.floor((new Date() - this.startTime) / 1000),
      threatRate: this.totalRequests > 0 
        ? ((this.blockedRequests / this.totalRequests) * 100).toFixed(2)
        : 0
    };
  }

  getTopThreats(limit = 5) {
    return Object.entries(this.threatsByType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([type, count]) => ({ type, count }));
  }

  getVulnerableEndpoints(limit = 5) {
    return Object.entries(this.endpointStats)
      .filter(([_, stat]) => stat.blocked > 0 || stat.suspicious > 0)
      .sort((a, b) => (b[1].blocked + b[1].suspicious) - (a[1].blocked + a[1].suspicious))
      .slice(0, limit)
      .map(([path, stat]) => ({
        path,
        threats: stat.blocked + stat.suspicious,
        blocked: stat.blocked,
        suspicious: stat.suspicious,
        averageRisk: Math.round(stat.averageRisk)
      }));
  }

  getSummary() {
    const recentLogs = logger.getRecentLogs(100);
    const recentBlocked = recentLogs.filter(log => log.type === 'blocked').slice(0, 10);

    return {
      ...this.getMetrics(),
      recentThreats: recentBlocked.map(log => ({
        timestamp: log.timestamp,
        method: log.method,
        path: log.path,
        ip: log.ip,
        riskScore: log.riskScore,
        reason: log.reason
      }))
    };
  }
}

module.exports = new SecurityMetrics();
