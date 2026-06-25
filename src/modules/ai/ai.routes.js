const express = require('express');
const { authenticate } = require('../../shared/middleware/auth.middleware');
const { chatWithAI } = require('./ai.controller');

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * /ai/chat:
 *   post:
 *     summary: Chat with the TaskPulse AI Assistant
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [messages]
 *             properties:
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, ai]
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: AI response
 */
router.post('/chat', chatWithAI);

module.exports = router;
