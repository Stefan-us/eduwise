const tf = require('@tensorflow/tfjs');
const StudyPlan = require('../../models/StudyPlan');
const path = require('path');

class PerformanceAnalyzer {
  constructor(userId) {
    this.userId = userId;
    this.model = null;
    this.initialized = false;
    this.normalizedStats = {
      sessionDuration: { min: 0, max: 240 }, // 4 hours max
      topicDifficulty: { min: 0, max: 10 },
      learningVelocity: { min: 0, max: 5 } // topics per hour
    };
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Create a simple neural network for performance prediction
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [4], units: 16, activation: 'relu' }),
          tf.layers.dropout(0.2),
          tf.layers.dense({ units: 8, activation: 'relu' }),
          tf.layers.dense({ units: 4, activation: 'sigmoid' })
        ]
      });

      // Compile the model
      this.model.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'meanSquaredError',
        metrics: ['accuracy']
      });

      this.initialized = true;
      console.log('[PerformanceAnalyzer] Initialized neural network model');
    } catch (error) {
      console.error('[PerformanceAnalyzer] Error initializing model:', error);
      // Fallback to basic analysis if model initialization fails
    }
  }

  async analyzePerformance(metrics) {
    await this.initialize();

    // Calculate performance score using weighted metrics
    const weights = {
      completionRate: 0.4,
      duration: 0.2,
      difficulty: 0.2,
      velocity: 0.2
    };

    // Normalize metrics for neural network input
    const normalizedMetrics = [
      metrics.sessionCompletionRate,
      Math.min(metrics.averageSessionDuration / 120, 1),
      metrics.topicDifficulty / 10,
      Math.min(metrics.learningVelocity / 2, 1)
    ];

    let prediction;
    try {
      // Use neural network for prediction if available
      if (this.model && this.initialized) {
        const tensorInput = tf.tensor2d([normalizedMetrics]);
        const predictions = this.model.predict(tensorInput);
        const predictionValues = await predictions.data();
        prediction = predictionValues[0];
        tensorInput.dispose();
        predictions.dispose();
      } else {
        // Fallback to weighted calculation
        prediction = (
          normalizedMetrics[0] * weights.completionRate +
          normalizedMetrics[1] * weights.duration +
          normalizedMetrics[2] * weights.difficulty +
          normalizedMetrics[3] * weights.velocity
        );
      }
    } catch (error) {
      console.error('[PerformanceAnalyzer] Prediction error:', error);
      // Fallback to weighted calculation
      prediction = (
        normalizedMetrics[0] * weights.completionRate +
        normalizedMetrics[1] * weights.duration +
        normalizedMetrics[2] * weights.difficulty +
        normalizedMetrics[3] * weights.velocity
      );
    }

    // Generate AI-driven recommendations
    const recommendations = [];

    // Use neural network output for enhanced pattern detection
    const patterns = {
      completion: prediction < 0.4 ? 'low' : prediction < 0.7 ? 'medium' : 'high',
      efficiency: normalizedMetrics[1] < 0.3 ? 'low' : normalizedMetrics[1] > 0.8 ? 'high' : 'medium',
      progress: normalizedMetrics[3] < 0.2 ? 'slow' : normalizedMetrics[3] > 0.6 ? 'fast' : 'moderate'
    };

    // Analyze completion rate patterns with AI insights
    if (patterns.completion === 'low') {
      recommendations.push({
        type: 'completion',
        priority: 'high',
        message: 'Your session completion rate is low. Consider setting more achievable goals or breaking down sessions into smaller chunks.'
      });
    } else if (patterns.completion === 'medium') {
      recommendations.push({
        type: 'completion',
        priority: 'medium',
        message: 'Try to maintain a consistent study schedule to improve completion rate.'
      });
    }

    // Analyze duration patterns with efficiency insights
    if (metrics.averageSessionDuration < 30) {
      recommendations.push({
        type: 'duration',
        priority: 'high',
        message: 'Your study sessions are quite short. Consider extending them gradually for better learning outcomes.'
      });
    } else if (metrics.averageSessionDuration > 180) {
      recommendations.push({
        type: 'duration',
        priority: 'medium',
        message: 'Your sessions are quite long. Consider taking regular breaks using the Pomodoro technique.'
      });
    }

    // Analyze learning velocity with progress insights
    if (patterns.progress === 'slow') {
      recommendations.push({
        type: 'velocity',
        priority: 'high',
        message: 'Your learning pace seems slow. Try active recall techniques and spaced repetition.'
      });
    } else if (patterns.progress === 'fast') {
      recommendations.push({
        type: 'velocity',
        priority: 'medium',
        message: 'Great learning pace! Make sure to review materials regularly to retain information.'
      });
    }

    // Analyze difficulty patterns
    if (metrics.topicDifficulty > 7) {
      recommendations.push({
        type: 'difficulty',
        priority: 'high',
        message: 'You seem to be tackling challenging topics. Consider breaking them down into smaller, manageable concepts.'
      });
    }

    // Add personalized learning strategy based on patterns
    if (patterns.efficiency === 'low' && patterns.progress === 'slow') {
      recommendations.push({
        type: 'strategy',
        priority: 'high',
        message: 'Consider trying the Feynman Technique: Explain concepts in simple terms to improve understanding and retention.'
      });
    }

    return {
      prediction,
      metrics: {
        completionTrend: patterns.completion === 'high' ? 0.9 : patterns.completion === 'medium' ? 0.6 : 0.3,
        durationEfficiency: patterns.efficiency === 'high' ? 0.9 : patterns.efficiency === 'medium' ? 0.6 : 0.3,
        learningProgress: patterns.progress === 'fast' ? 0.9 : patterns.progress === 'moderate' ? 0.6 : 0.3
      },
      recommendations
    };
  }

  async calculateDailyMetrics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('[PerformanceAnalyzer] Starting daily metrics calculation for user:', this.userId);

    const studyPlans = await StudyPlan.find({
      user: this.userId,
      status: 'active'
    });

    console.log('[PerformanceAnalyzer] Found study plans:', studyPlans.length);

    const metrics = {
      sessionCompletionRate: 0,
      averageSessionDuration: 0,
      topicDifficulty: 0,
      learningVelocity: 0,
      predictedPerformance: 0,
      recommendations: []
    };

    if (studyPlans.length === 0) {
      console.log('[PerformanceAnalyzer] No active study plans found');
      return { metrics };
    }

    let totalSessions = 0;
    let completedSessions = 0;
    let totalDuration = 0;
    let totalDifficulty = 0;

    studyPlans.forEach(plan => {
      console.log('[PerformanceAnalyzer] Processing plan:', plan._id);
      console.log('[PerformanceAnalyzer] Plan sessions:', plan.aiGeneratedPlan.sessions.length);
      
      const sessions = plan.aiGeneratedPlan.sessions;
      totalSessions += sessions.length;
      const completedSessionsInPlan = sessions.filter(s => s.completed).length;
      completedSessions += completedSessionsInPlan;
      
      console.log('[PerformanceAnalyzer] Plan completed sessions:', completedSessionsInPlan);
      
      sessions.forEach(session => {
        if (session.completed) {
          const duration = this.parseSessionDuration(session.duration);
          console.log('[PerformanceAnalyzer] Session duration:', session.duration, 'parsed as:', duration);
          totalDuration += duration;
          totalDifficulty += plan.metrics.topicDifficulty || 0;
        }
      });
    });

    console.log('[PerformanceAnalyzer] Total metrics:', {
      totalSessions,
      completedSessions,
      totalDuration,
      totalDifficulty
    });

    metrics.sessionCompletionRate = totalSessions > 0 ? completedSessions / totalSessions : 0;
    metrics.averageSessionDuration = completedSessions > 0 ? totalDuration / completedSessions : 0;
    metrics.topicDifficulty = completedSessions > 0 ? totalDifficulty / completedSessions : 0;
    metrics.learningVelocity = this.calculateLearningVelocity(studyPlans);

    console.log('[PerformanceAnalyzer] Calculated metrics:', metrics);
    
    // Get predictions and recommendations
    const analysis = await this.analyzePerformance(metrics);
    metrics.predictedPerformance = analysis.prediction;
    metrics.recommendations = analysis.recommendations;

    console.log('[PerformanceAnalyzer] Final metrics with predictions:', metrics);

    return { 
      metrics,
      normalized: this.normalizeMetrics(metrics)
    };
  }

  async getTrends(period = 'daily') {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default: // daily
        startDate.setDate(startDate.getDate() - 1);
    }

    const studyPlans = await StudyPlan.find({
      user: this.userId,
      status: 'active',
      'aiGeneratedPlan.sessions.day': {
        $gte: startDate,
        $lte: endDate
      }
    });

    return this.aggregateTrendData(studyPlans, period);
  }

  calculateLearningVelocity(studyPlans) {
    console.log('[PerformanceAnalyzer] Calculating learning velocity');
    
    let velocity = 0;
    
    if (studyPlans.length === 0) {
      console.log('[PerformanceAnalyzer] No study plans for velocity calculation');
      return velocity;
    }

    const completedTopics = new Set();
    let totalTime = 0;

    studyPlans.forEach(plan => {
      console.log('[PerformanceAnalyzer] Processing plan for velocity:', plan._id);
      plan.aiGeneratedPlan.sessions.forEach(session => {
        if (session.completed) {
          completedTopics.add(session.topic);
          const sessionDuration = this.parseSessionDuration(session.duration);
          totalTime += sessionDuration;
          console.log('[PerformanceAnalyzer] Session duration for velocity:', sessionDuration);
        }
      });
    });

    console.log('[PerformanceAnalyzer] Velocity calculation:', {
      completedTopics: completedTopics.size,
      totalTime
    });

    // Learning velocity = topics completed per hour
    velocity = totalTime > 0 ? completedTopics.size / (totalTime / 60) : 0;
    console.log('[PerformanceAnalyzer] Final velocity:', velocity);
    return velocity;
  }

  aggregateTrendData(studyPlans, period) {
    const trends = [];
    const periodMap = {
      daily: { unit: 'hour', count: 24 },
      weekly: { unit: 'day', count: 7 },
      monthly: { unit: 'day', count: 30 }
    };

    const { unit, count } = periodMap[period];

    for (let i = 0; i < count; i++) {
      trends.push({
        timeUnit: i,
        sessionCompletionRate: 0,
        averageSessionDuration: 0,
        topicDifficulty: 0,
        learningVelocity: 0
      });
    }

    studyPlans.forEach(plan => {
      plan.aiGeneratedPlan.sessions.forEach(session => {
        const sessionDate = new Date(session.day);
        let timeUnit;

        switch (period) {
          case 'daily':
            timeUnit = sessionDate.getHours();
            break;
          case 'weekly':
          case 'monthly':
            timeUnit = sessionDate.getDate() % count;
            break;
        }

        const trendPoint = trends[timeUnit];
        if (session.completed) {
          trendPoint.sessionCompletionRate++;
          trendPoint.averageSessionDuration += this.parseSessionDuration(session.duration);
          trendPoint.topicDifficulty += plan.metrics.topicDifficulty || 0;
          trendPoint.learningVelocity = this.calculateLearningVelocity([plan]);
        }
      });
    });

    return trends;
  }

  parseSessionDuration(duration) {
    if (!duration) {
      console.log('[PerformanceAnalyzer] No duration provided');
      return 0;
    }
    
    // If duration is already in minutes (just a number string)
    if (!duration.includes(':')) {
      const minutes = parseInt(duration, 10);
      console.log('[PerformanceAnalyzer] Parsed plain minutes:', minutes);
      return minutes;
    }
    
    // If duration is in HH:mm format
    const [hours, minutes] = duration.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    console.log('[PerformanceAnalyzer] Parsed HH:mm format:', duration, 'as minutes:', totalMinutes);
    return totalMinutes;
  }

  normalizeMetrics(metrics) {
    return {
      sessionCompletionRate: metrics.sessionCompletionRate, // already 0-1
      averageSessionDuration: (metrics.averageSessionDuration / 60) / this.normalizedStats.sessionDuration.max,
      topicDifficulty: metrics.topicDifficulty / this.normalizedStats.topicDifficulty.max,
      learningVelocity: metrics.learningVelocity / this.normalizedStats.learningVelocity.max
    };
  }

  denormalizeMetrics(normalized) {
    return {
      sessionCompletionRate: normalized.sessionCompletionRate,
      averageSessionDuration: normalized.averageSessionDuration * this.normalizedStats.sessionDuration.max * 60,
      topicDifficulty: normalized.topicDifficulty * this.normalizedStats.topicDifficulty.max,
      learningVelocity: normalized.learningVelocity * this.normalizedStats.learningVelocity.max
    };
  }
}

module.exports = PerformanceAnalyzer; 