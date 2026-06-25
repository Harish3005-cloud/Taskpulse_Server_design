const AppError = require('../../shared/utils/AppError');
const Digest = require('./analytics.model');

/**
 * GET /api/v1/analytics
 * Get dashboard stats
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const { workspaceId, range } = req.query;
    if (!workspaceId) {
      throw new AppError('workspaceId query parameter is required', 400);
    }
    
    // Mock analytics logic based on range (7d, 30d, 90d)
    res.status(200).json({
      success: true,
      data: {
        totalTasks: 120,
        completedTasks: 85,
        overdueTasks: 5,
        completionRate: 70.8,
        range: range || '7d'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/analytics/digest
 * Get latest weekly digest
 */
const getLatestDigest = async (req, res, next) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) {
      throw new AppError('workspaceId query parameter is required', 400);
    }

    // Try to find the most recent digest
    let digest = await Digest.findOne({ workspaceId }).sort({ year: -1, week: -1 });

    if (!digest) {
      // Mock digest if none exists
      digest = {
        week: 25,
        year: 2026,
        content: "This week you completed 85 tasks. Great job on prioritizing high-urgency bugs! Next week, consider tackling the technical debt items that have been deferred.",
        totalTasks: 100,
        completedTasks: 85,
        overdueTasks: 2,
        avgPriority: 3.5,
        generatedAt: new Date()
      };
    }

    res.status(200).json({
      success: true,
      digest
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getLatestDigest
};
