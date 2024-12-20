const { Parser } = require('json2csv');
const PerformanceAnalyzer = require('../services/analyzer/PerformanceAnalyzer');
const StudyPlan = require('../models/StudyPlan');

const getPerformanceMetrics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const analyzer = new PerformanceAnalyzer(userId);

    // Calculate today's metrics
    const { metrics, normalized } = await analyzer.calculateDailyMetrics();

    // Get trend data
    const [daily, weekly, monthly] = await Promise.all([
      analyzer.getTrends('daily'),
      analyzer.getTrends('weekly'),
      analyzer.getTrends('monthly'),
    ]);

    res.json({
      metrics,
      normalized,
      trends: {
        daily,
        weekly,
        monthly,
      }
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({
      error: 'Failed to fetch performance metrics',
      details: error.message,
    });
  }
};

const refreshMetrics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const analyzer = new PerformanceAnalyzer(userId);
    const { metrics, normalized } = await analyzer.calculateDailyMetrics();

    res.json({
      message: 'Performance metrics refreshed successfully',
      metrics,
      normalized
    });
  } catch (error) {
    console.error('Error refreshing performance metrics:', error);
    res.status(500).json({
      error: 'Failed to refresh performance metrics',
      details: error.message,
    });
  }
};

const getHistoricalMetrics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;

    const query = { user: userId, status: 'active' };

    if (startDate) {
      query['aiGeneratedPlan.sessions.day'] = { $gte: new Date(startDate) };
    }

    if (endDate) {
      query['aiGeneratedPlan.sessions.day'] = { 
        ...query['aiGeneratedPlan.sessions.day'],
        $lte: new Date(endDate)
      };
    }

    const analyzer = new PerformanceAnalyzer(userId);
    const studyPlans = await StudyPlan.find(query)
      .sort({ 'aiGeneratedPlan.sessions.day': 1 })
      .select('metrics aiGeneratedPlan.sessions subject');

    const metrics = await Promise.all(studyPlans.map(async plan => {
      const planMetrics = analyzer.calculateMetricsFromPlan(plan);
      const analysis = await analyzer.analyzePerformance(planMetrics);
      
      return {
        date: plan.aiGeneratedPlan.sessions[0].day,
        subject: plan.subject,
        metrics: planMetrics,
        predictedPerformance: analysis.prediction,
        recommendations: analysis.recommendations
      };
    }));

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching historical metrics:', error);
    res.status(500).json({
      error: 'Failed to fetch historical metrics',
      details: error.message,
    });
  }
};

const exportMetrics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { format = 'json' } = req.query;
    const analyzer = new PerformanceAnalyzer(userId);
    
    const studyPlans = await StudyPlan.find({ user: userId, status: 'active' })
      .sort({ 'aiGeneratedPlan.sessions.day': 1 })
      .select('metrics aiGeneratedPlan.sessions subject');

    const metrics = await Promise.all(studyPlans.map(async plan => {
      const planMetrics = analyzer.calculateMetricsFromPlan(plan);
      const analysis = await analyzer.analyzePerformance(planMetrics);
      
      return {
        date: plan.aiGeneratedPlan.sessions[0].day,
        subject: plan.subject,
        'metrics.sessionCompletionRate': planMetrics.sessionCompletionRate,
        'metrics.averageSessionDuration': planMetrics.averageSessionDuration,
        'metrics.topicDifficulty': planMetrics.topicDifficulty,
        'metrics.learningVelocity': planMetrics.learningVelocity,
        'metrics.predictedPerformance': analysis.prediction,
        recommendations: analysis.recommendations
      };
    }));

    switch (format) {
      case 'csv': {
        const fields = [
          'date',
          'subject',
          'metrics.sessionCompletionRate',
          'metrics.averageSessionDuration',
          'metrics.topicDifficulty',
          'metrics.learningVelocity',
          'metrics.predictedPerformance',
          'recommendations'
        ];
        
        const parser = new Parser({ fields });
        const csv = parser.parse(metrics);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=performance-metrics.csv');
        res.send(csv);
        break;
      }

      case 'json':
      default:
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=performance-metrics.json');
        res.json(metrics);
    }
  } catch (error) {
    console.error('Error exporting metrics:', error);
    res.status(500).json({
      error: 'Failed to export metrics',
      details: error.message,
    });
  }
};

module.exports = {
  getPerformanceMetrics,
  refreshMetrics,
  getHistoricalMetrics,
  exportMetrics,
}; 