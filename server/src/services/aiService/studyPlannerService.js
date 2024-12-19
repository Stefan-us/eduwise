class StudyPlannerService {
  constructor() {
    this.initialized = false;
  }

  async generateStudyPlan({
    subject,
    goal,
    deadline,
    preferredTimes,
    restrictions,
    learningStyle,
    difficultyPreference
  }) {
    try {
      // Generate a study plan using heuristic algorithms
      const daysUntilDeadline = this.calculateDaysUntil(deadline);
      const sessionsPerDay = this.calculateOptimalSessionsPerDay(daysUntilDeadline, goal);
      
      // Generate study sessions
      const sessions = this.generateSessions({
        daysUntilDeadline,
        sessionsPerDay,
        preferredTimes,
        restrictions
      });

      return {
        sessions,
        metadata: {
          subject,
          goal,
          learningStyle,
          difficultyPreference,
          generatedAt: new Date(),
          lastUpdated: new Date()
        }
      };
    } catch (error) {
      console.error('Study plan generation failed:', error);
      throw new Error('Failed to generate study plan');
    }
  }

  calculateDaysUntil(deadline) {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    return Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
  }

  calculateOptimalSessionsPerDay(daysUntilDeadline, goal) {
    // Basic algorithm to determine sessions per day based on goal and available time
    const totalHoursNeeded = this.estimateTotalHours(goal);
    return Math.ceil(totalHoursNeeded / daysUntilDeadline);
  }

  estimateTotalHours(goal) {
    // Simple estimation based on goal complexity
    const baseHours = 20; // Base hours for a typical goal
    const complexity = this.assessGoalComplexity(goal);
    return baseHours * complexity;
  }

  assessGoalComplexity(goal) {
    // Simple complexity assessment based on goal description
    const words = goal.toLowerCase().split(' ');
    const complexityIndicators = ['advanced', 'complex', 'comprehensive', 'deep', 'thorough'];
    const matches = words.filter(word => complexityIndicators.includes(word));
    return 1 + (matches.length * 0.2); // Increase complexity for each matching indicator
  }

  generateSessions({ daysUntilDeadline, sessionsPerDay, preferredTimes, restrictions }) {
    const sessions = [];
    const now = new Date();

    for (let day = 0; day < daysUntilDeadline; day++) {
      const currentDate = new Date(now);
      currentDate.setDate(currentDate.getDate() + day);

      for (let session = 0; session < sessionsPerDay; session++) {
        // Skip if the day is in restrictions
        if (this.isDayRestricted(currentDate, restrictions)) {
          continue;
        }

        const preferredTime = preferredTimes[session % preferredTimes.length];
        
        sessions.push({
          date: currentDate.toISOString().split('T')[0],
          time: preferredTime,
          duration: 45, // Duration in minutes
          status: 'pending',
          completed: false
        });
      }
    }

    return sessions;
  }

  isDayRestricted(date, restrictions) {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return restrictions.some(restriction => 
      restriction.toLowerCase().includes(dayOfWeek)
    );
  }

  async generateRescheduleSuggestions({ plan, session, userId }) {
    try {
      const now = new Date();
      const deadline = new Date(plan.deadline);
      const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

      // Get user's preferred times and restrictions
      const { preferredTimes, restrictions } = plan;
      
      // Get completion patterns from metrics
      const completionPatterns = await this.analyzeCompletionPatterns(plan);
      
      // Generate potential time slots
      const suggestions = [];
      const maxSuggestions = 3;
      let currentDate = new Date();

      while (suggestions.length < maxSuggestions && currentDate < deadline) {
        // Skip to next day if current day is restricted
        if (this.isDayRestricted(currentDate, restrictions)) {
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }

        // Check each preferred time slot
        for (const timeSlot of preferredTimes) {
          if (suggestions.length >= maxSuggestions) break;

          const successRate = completionPatterns[timeSlot] || 0.5;
          const isGoodTimeSlot = successRate > 0.6;

          if (isGoodTimeSlot) {
            suggestions.push({
              sessionId: session._id,
              time: `${currentDate.toISOString().split('T')[0]} ${timeSlot}`,
              reason: `${Math.round(successRate * 100)}% completion rate in this time slot`
            });
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return suggestions;
    } catch (error) {
      console.error('Error generating reschedule suggestions:', error);
      throw error;
    }
  }

  async analyzeCompletionPatterns(plan) {
    const patterns = {};
    const { sessions } = plan.aiGeneratedPlan;

    // Group sessions by time slot and calculate completion rates
    sessions.forEach(session => {
      const timeSlot = session.time;
      if (!patterns[timeSlot]) {
        patterns[timeSlot] = {
          total: 0,
          completed: 0
        };
      }
      patterns[timeSlot].total++;
      if (session.completed) {
        patterns[timeSlot].completed++;
      }
    });

    // Calculate success rates for each time slot
    Object.keys(patterns).forEach(timeSlot => {
      const { total, completed } = patterns[timeSlot];
      patterns[timeSlot] = completed / total;
    });

    return patterns;
  }
}

module.exports = new StudyPlannerService(); 