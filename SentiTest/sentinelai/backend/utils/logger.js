const { v4: uuidv4 } = require('uuid');

class SecurityLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 logs in memory
  }

  log(type, data) {
    const logEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type,
      ...data
    };

    this.logs.unshift(logEntry);
    
    // Keep only maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Console output for monitoring
    const emoji = type === 'blocked' ? '🛑' : type === 'suspicious' ? '⚠️' : '✅';
    console.log(`${emoji} [${type.toUpperCase()}] ${data.method} ${data.path} - Risk: ${data.riskScore}`);

    return logEntry;
  }

  clearLogs() {
    this.logs = [];
  }

  logRequest(requestData, riskScore, decision, reason) {
    return this.log(decision, {
      ...requestData,
      riskScore,
      decision,
      reason
    });
  }

  getRecentLogs(limit = 50) {
    return this.logs.slice(0, limit);
  }

  getLogsByType(type, limit = 50) {
    return this.logs.filter(log => log.type === type).slice(0, limit);
  }

  clearLogs() {
    this.logs = [];
  }
}

module.exports = new SecurityLogger();
