const config = require('../config/config')

class AIAnalyzer {
  constructor() {
    this.enabled = config.aiEnabled
    this.aiServer = config.aiServerUrl || 'http://localhost:3001'
  }

  /**
   * Analyze suspicious requests using Grok AI server
   */
  async analyzeRequest(requestData, riskScore, threats) {
    if (!this.enabled) {
      return {
        aiAnalyzed: false,
        recommendation: 'allow',
        confidence: 0,
        reasoning: 'AI disabled'
      }
    }

    try {
      const payload = {
        attackType: threats[0] || 'Unknown Threat',
        endpoint: requestData.path,
        riskScore
      }

      const response = await fetch(`${this.aiServer}/api/attack-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      let recommendation = 'allow'
      let confidence = 0.7

      if (riskScore >= 70) recommendation = 'block'
      else if (riskScore >= 40) recommendation = 'monitor'

      return {
        aiAnalyzed: true,
        recommendation,
        confidence,
        reasoning: data.analysis || 'AI analysis completed'
      }

    } catch (error) {

      console.error('AI server error:', error.message)

      // Rule-based fallback system
      if (riskScore >= 70) {
        return {
          aiAnalyzed: false,
          recommendation: 'block',
          confidence: 0.8,
          reasoning: 'Fallback rule-based block due to high risk score'
        }
      }

      return {
        aiAnalyzed: false,
        recommendation: 'monitor',
        confidence: 0.6,
        reasoning: 'AI unavailable, using fallback detection'
      }
    }
  }
}

module.exports = new AIAnalyzer()