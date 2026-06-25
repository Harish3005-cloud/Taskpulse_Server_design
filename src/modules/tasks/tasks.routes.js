const express = require('express');
const { authenticate } = require('../../shared/middleware/auth.middleware');
const {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getPresignedUrl
} = require('./tasks.controller');

const router = express.Router();

// All task routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: List tasks for a workspace
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get('/', listTasks);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get task details
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task details
 */
router.get('/:id', getTask);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task (triggers AI scoring)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [workspaceId, title]
 *             properties:
 *               workspaceId:
 *                 type: string
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created
 */
router.post('/', createTask);

/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     summary: Update an existing task
 *     tags: [Tasks]
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
 *             required: [workspaceId]
 *             properties:
 *               workspaceId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated
 */
router.patch('/:id', updateTask);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Soft delete a task
 *     tags: [Tasks]
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
 *             required: [workspaceId]
 *             properties:
 *               workspaceId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task deleted
 */
router.delete('/:id', deleteTask);

/**
 * @swagger
 * /tasks/{id}/attachments:
 *   post:
 *     summary: Get an S3 presigned URL for direct file upload
 *     tags: [Tasks]
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
 *             required: [workspaceId, fileName, fileSize, mimeType]
 *             properties:
 *               workspaceId:
 *                 type: string
 *               fileName:
 *                 type: string
 *               fileSize:
 *                 type: number
 *               mimeType:
 *                 type: string
 *     responses:
 *       201:
 *         description: Presigned URL generated
 */
router.post('/:id/attachments', getPresignedUrl);

module.exports = router;
