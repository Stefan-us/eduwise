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
}

module.exports = new StudyPlannerService(); 