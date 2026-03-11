require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // AI Configuration
  aiEnabled: process.env.AI_ENABLED === 'true',
  openaiApiKey: process.env.OPENAI_API_KEY,
  
  // Security Thresholds
  maxRiskScore: parseInt(process.env.MAX_RISK_SCORE) || 100,
  blockThreshold: parseInt(process.env.BLOCK_THRESHOLD) || 60,
  aiAnalysisThreshold: parseInt(process.env.AI_ANALYSIS_THRESHOLD) || 33,
  
  // Rate Limiting
  rateLimit: {
    points: parseInt(process.env.RATE_LIMIT_POINTS) || 100,
    duration: parseInt(process.env.RATE_LIMIT_DURATION) || 60
  },

  // Advanced Rate Limiting Configuration
  advancedRateLimiting: {
    enabled: process.env.ADVANCED_RATE_LIMITING !== 'false',
    windows: [
      { duration: 10000, maxRequests: 15, score: 25 },   // 10 seconds
      { duration: 60000, maxRequests: 60, score: 35 },   // 1 minute
      { duration: 600000, maxRequests: 300, score: 45 }, // 10 minutes
      { duration: 3600000, maxRequests: 1000, score: 60 } // 1 hour
    ],
    escalationThresholds: [5, 20], // Violations for escalation
    endpointLimits: {
      '/api/auth/': 10,    // Auth endpoints
      '/api/admin/': 20,   // Admin endpoints
      '/api/payment/': 15, // Payment endpoints
      '/api/public/': 100  // Public endpoints
    },
    burstThresholds: {
      micro: { duration: 1000, maxRequests: 5, score: 35 },  // 1 second
      short: { duration: 5000, maxRequests: 10, score: 30 } // 5 seconds
    }
  },

  // Anomaly Detection Configuration
  anomalyDetection: {
    enabled: process.env.ANOMALY_DETECTION !== 'false',
    strictMethodValidation: process.env.STRICT_METHOD_VALIDATION === 'true',
    parameterValidation: process.env.PARAMETER_VALIDATION !== 'false',
    maxPayloadSize: parseInt(process.env.MAX_PAYLOAD_SIZE) || 10000,
    maxQueryParamCount: parseInt(process.env.MAX_QUERY_PARAM_COUNT) || 20,
    criticalFields: ['username', 'password', 'email', 'token']
  },

  // Behavior Analysis Configuration
  behaviorAnalysis: {
    enabled: process.env.BEHAVIOR_ANALYSIS !== 'false',
    maxSessionDuration: parseInt(process.env.MAX_SESSION_DURATION) || 86400000, // 24 hours
    maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 100,
    botDetectionPatterns: [
      /bot/i, /crawler/i, /spider/i, /scraper/i,
      /curl/i, /wget/i, /python/i, /java/i,
      /postman/i, /insomnia/i, /httpie/i
    ]
  },

  // Threat Intelligence Configuration
  threatIntelligence: {
    enabled: process.env.THREAT_INTELLIGENCE === 'true',
    updateInterval: parseInt(process.env.THREAT_UPDATE_INTERVAL) || 3600000, // 1 hour
    sources: (process.env.THREAT_SOURCES || '').split(',') || ['virustotal', 'abuseipdb'],
    apiKey: process.env.THREAT_API_KEY
  },
  
  // Endpoint Sensitivity Levels
  endpointSensitivity: {
    '/api/admin': 30,
    '/api/auth/login': 20,
    '/api/auth/register': 15,
    '/api/user/delete': 25,
    '/api/payment': 30,
    '/api/database': 35,
    '/api/config': 30,
    '/api/users': 15,
    '/api/public': 5,
    'default': 10
  },
  
  // Suspicious Patterns
  suspiciousPatterns: {
    sqlInjection: [
      /(\bunion\b.*\bselect\b)|(\bselect\b.*\bfrom\b)/gi,
      /(\bdrop\b.*\btable\b)|(\bdelete\b.*\bfrom\b)/gi,
      /(--)|(\b(and|or)\b\s*\d+\s*=\s*\d+)/gi,
      /('.*\bor\b.*'=')|('.*\band\b.*'=')/gi,
      /\b(exec|execute|sp_executesql)\b/gi
    ],
    xss: [
      /<script[^>]*>.*<\/script>/gi,
      /javascript:/gi,
      /on(load|error|click|mouseover)\s*=/gi,
      /<iframe[^>]*>/gi,
      /eval\s*\(/gi
    ],
    pathTraversal: [
      /\.\.[\/\\]/g,
      /\/etc\/passwd/gi,
      /\/windows\/system32/gi
    ],
    commandInjection: [
      /[;&|`$()]/g,
      /\b(cat|ls|wget|curl|nc|bash|sh)\b/gi
    ]
  }
};
