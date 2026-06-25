const express = require('express');
const { authenticate } = require('../../shared/middleware/auth.middleware');
const { getDashboardStats, getLatestDigest } = require('./analytics.controller');

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * /analytics:
 *   get:
 *     summary: Get dashboard statistics
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
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get('/', getDashboardStats);

/**
 * @swagger
 * /analytics/digest:
 *   get:
 *     summary: Get the latest weekly AI digest
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Latest digest
 */
router.get('/digest', getLatestDigest);

module.exports = router;
