const express = require('express');
const { authenticate } = require('../../shared/middleware/auth.middleware');
const { 
  listWorkspaces, 
  getWorkspace, 
  getWorkspaceMembers,
  updateWorkspace
} = require('./workspaces.controller');

const router = express.Router();

// All workspace routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /workspaces:
 *   get:
 *     summary: List all workspaces for the authenticated user
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workspaces
 */
router.get('/', listWorkspaces);

/**
 * @swagger
 * /workspaces/{id}:
 *   get:
 *     summary: Get workspace by ID
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workspace details
 *       404:
 *         description: Workspace not found
 */
router.get('/:id', getWorkspace);

/**
 * @swagger
 * /workspaces/{id}/members:
 *   get:
 *     summary: Get workspace members
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of members
 *       404:
 *         description: Workspace not found
 */
router.get('/:id/members', getWorkspaceMembers);

/**
 * @swagger
 * /workspaces/{id}:
 *   patch:
 *     summary: Update workspace (owner/admin only)
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               timezone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Workspace updated
 *       403:
 *         description: Not authorized
 */
router.patch('/:id', updateWorkspace);

module.exports = router;
