const express = require('express');
const { authenticate } = require('../../shared/middleware/auth.middleware');
const { 
  getSummary,
  getProjects,
  getStatus,
  getPriorities,
  getTeam,
  getDeadlines,
  getTrends,
  getWorkspaceHealth
} = require('./analytics.controller');

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * /analytics/summary:
 *   get:
 *     summary: Get overall workspace analytics summary
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/summary', getSummary);

/**
 * @swagger
 * /analytics/projects:
 *   get:
 *     summary: Get progress analytics for all projects in workspace
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/projects', getProjects);

/**
 * @swagger
 * /analytics/status:
 *   get:
 *     summary: Get task status distribution (e.g. for pie charts)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/status', getStatus);

/**
 * @swagger
 * /analytics/priorities:
 *   get:
 *     summary: Get task priority distribution
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/priorities', getPriorities);

/**
 * @swagger
 * /analytics/team:
 *   get:
 *     summary: Get team performance and workload distribution
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/team', getTeam);

/**
 * @swagger
 * /analytics/deadlines:
 *   get:
 *     summary: Get upcoming deadlines sorted by nearest
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/deadlines', getDeadlines);

/**
 * @swagger
 * /analytics/trends:
 *   get:
 *     summary: Get task completion trends over a specific range
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d]
 *           default: 7d
 */
router.get('/trends', getTrends);

/**
 * @swagger
 * /analytics/workspace-health:
 *   get:
 *     summary: Get AI-ready workspace health and recommendations
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/workspace-health', getWorkspaceHealth);

module.exports = router;
