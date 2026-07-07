const mongoose = require('mongoose');
const Task = require('../tasks/tasks.model');
const Project = require('../projects/projects.model');
const Workspace = require('../workspaces/workspaces.model');
const AppError = require('../../shared/utils/AppError');

const verifyWorkspaceAccess = async (workspaceId, userId) => {
  const workspace = await Workspace.findOne({
    _id: workspaceId,
    'members.userId': userId,
    archivedAt: null
  });
  if (!workspace) throw new AppError('Workspace not found or access denied', 404);
  return workspace;
};

const getWorkspaceSummary = async (workspaceId, userId) => {
  const workspace = await verifyWorkspaceAccess(workspaceId, userId);
  const wId = new mongoose.Types.ObjectId(workspaceId);

  const [projectCount, taskStats] = await Promise.all([
    Project.countDocuments({ workspaceId: wId, archivedAt: null }),
    Task.aggregate([
      { $match: { workspaceId: wId, archivedAt: null } },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
          },
          pendingTasks: {
            $sum: { $cond: [{ $ne: ['$status', 'done'] }, 1, 0] }
          },
          overdueTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', 'done'] },
                    { $lt: ['$dueDate', new Date()] },
                    { $ne: ['$dueDate', null] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ])
  ]);

  const stats = taskStats[0] || {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0
  };

  const completionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  const activeMembers = workspace.members ? workspace.members.length : 0;

  return {
    totalProjects: projectCount,
    totalTasks: stats.totalTasks,
    completedTasks: stats.completedTasks,
    pendingTasks: stats.pendingTasks,
    overdueTasks: stats.overdueTasks,
    completionRate,
    activeMembers
  };
};

const getProjectProgress = async (workspaceId, userId) => {
  await verifyWorkspaceAccess(workspaceId, userId);
  const wId = new mongoose.Types.ObjectId(workspaceId);

  const projectProgress = await Project.aggregate([
    { $match: { workspaceId: wId, archivedAt: null } },
    {
      $lookup: {
        from: 'tasks',
        let: { projectId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$projectId', '$$projectId'] }, archivedAt: null } }
        ],
        as: 'tasks'
      }
    },
    {
      $project: {
        projectId: '$_id',
        projectName: '$name',
        totalTasks: { $size: '$tasks' },
        completedTasks: {
          $size: {
            $filter: {
              input: '$tasks',
              as: 'task',
              cond: { $eq: ['$$task.status', 'done'] }
            }
          }
        }
      }
    },
    {
      $addFields: {
        progress: {
          $cond: [
            { $gt: ['$totalTasks', 0] },
            { $round: [{ $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] }, 0] },
            0
          ]
        }
      }
    },
    {
      $project: {
        _id: 0,
        projectId: 1,
        projectName: 1,
        totalTasks: 1,
        completedTasks: 1,
        progress: 1
      }
    }
  ]);

  return projectProgress;
};

const getTaskStatusDistribution = async (workspaceId, userId) => {
  await verifyWorkspaceAccess(workspaceId, userId);
  const wId = new mongoose.Types.ObjectId(workspaceId);

  const distribution = await Task.aggregate([
    { $match: { workspaceId: wId, archivedAt: null } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        status: '$_id',
        count: 1
      }
    }
  ]);

  return distribution;
};

const getPriorityDistribution = async (workspaceId, userId) => {
  await verifyWorkspaceAccess(workspaceId, userId);
  const wId = new mongoose.Types.ObjectId(workspaceId);

  const distribution = await Task.aggregate([
    { $match: { workspaceId: wId, archivedAt: null, priority: { $ne: null } } },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        priority: '$_id',
        count: 1
      }
    },
    { $sort: { priority: -1 } }
  ]);

  return distribution;
};

const getTeamPerformance = async (workspaceId, userId) => {
  await verifyWorkspaceAccess(workspaceId, userId);
  const wId = new mongoose.Types.ObjectId(workspaceId);

  const performance = await Task.aggregate([
    { $match: { workspaceId: wId, archivedAt: null, assignedTo: { $ne: null } } },
    {
      $group: {
        _id: '$assignedTo',
        assignedTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        name: '$user.name',
        assignedTasks: 1,
        completedTasks: 1,
        completionRate: {
          $cond: [
            { $gt: ['$assignedTasks', 0] },
            { $round: [{ $multiply: [{ $divide: ['$completedTasks', '$assignedTasks'] }, 100] }, 0] },
            0
          ]
        }
      }
    }
  ]);

  return performance;
};

const getUpcomingDeadlines = async (workspaceId, userId) => {
  await verifyWorkspaceAccess(workspaceId, userId);
  
  const tasks = await Task.find({
    workspaceId: new mongoose.Types.ObjectId(workspaceId),
    archivedAt: null,
    status: { $ne: 'done' },
    dueDate: { $gte: new Date() }
  })
    .sort({ dueDate: 1 })
    .limit(10)
    .populate('projectId', 'name')
    .lean();

  return tasks.map(task => ({
    taskId: task._id,
    title: task.title,
    dueDate: task.dueDate,
    project: task.projectId ? task.projectId.name : null
  }));
};

const getCompletionTrends = async (workspaceId, userId, range = '7d') => {
  await verifyWorkspaceAccess(workspaceId, userId);
  const wId = new mongoose.Types.ObjectId(workspaceId);

  let days = 7;
  if (range === '30d') days = 30;
  if (range === '90d') days = 90;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const trends = await Task.aggregate([
    {
      $match: {
        workspaceId: wId,
        archivedAt: null,
        status: 'done',
        completedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
        completedTasks: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        completedTasks: 1
      }
    },
    { $sort: { date: 1 } }
  ]);

  return trends;
};

const getWorkspaceHealth = async (workspaceId, userId) => {
  const summary = await getWorkspaceSummary(workspaceId, userId);
  const projectProgress = await getProjectProgress(workspaceId, userId);
  const teamPerformance = await getTeamPerformance(workspaceId, userId);

  const delayedProjects = projectProgress.filter(p => p.progress < 50).length; // Rule for delayed
  
  // Calculate health score (0-100)
  let healthScore = 100;
  
  if (summary.totalTasks > 0) {
    const overduePenalty = (summary.overdueTasks / summary.totalTasks) * 50; 
    healthScore -= overduePenalty;
  }
  if (summary.completionRate < 50) {
    healthScore -= 20;
  }
  
  healthScore = Math.max(0, Math.round(healthScore));

  const recommendations = [];
  if (summary.overdueTasks > 0) {
    recommendations.push(`There are ${summary.overdueTasks} overdue tasks across the workspace. Prioritize closing them.`);
  }
  if (delayedProjects > 0) {
    recommendations.push(`${delayedProjects} projects are progressing slower than expected (<50% complete).`);
  }
  if (summary.completionRate < 60) {
    recommendations.push(`Workspace completion rate is currently at ${summary.completionRate}%. Consider reviewing workload distribution.`);
  }

  // Workload distribution simple stat
  const avgTasksPerUser = teamPerformance.length > 0 
    ? Math.round(teamPerformance.reduce((acc, curr) => acc + curr.assignedTasks, 0) / teamPerformance.length) 
    : 0;

  const overloadedUsers = teamPerformance.filter(t => t.assignedTasks > avgTasksPerUser * 1.5);
  if (overloadedUsers.length > 0) {
    recommendations.push(`${overloadedUsers.map(u => u.name).join(', ')} have significantly more tasks assigned than the team average.`);
  }

  return {
    healthScore,
    delayedProjects,
    overdueTasks: summary.overdueTasks,
    completionRate: summary.completionRate,
    workloadDistribution: {
      averageTasksPerUser: avgTasksPerUser,
      overloadedUsersCount: overloadedUsers.length
    },
    recommendations: recommendations.length > 0 ? recommendations : ["Your workspace is healthy and on track!"]
  };
};

module.exports = {
  getWorkspaceSummary,
  getProjectProgress,
  getTaskStatusDistribution,
  getPriorityDistribution,
  getTeamPerformance,
  getUpcomingDeadlines,
  getCompletionTrends,
  getWorkspaceHealth
};
