const express = require('express');
const { authenticate } = require('../../shared/middleware/auth.middleware');
const { validateInvite, claimInvite } = require('./invites.controller');

const router = express.Router();

/**
 * @swagger
 * /invites/{token}:
 *   get:
 *     summary: Validate invite token
 *     tags: [Invites]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invite details
 */
router.get('/:token', validateInvite);

/**
 * @swagger
 * /invites/{token}/claim:
 *   post:
 *     summary: Join workspace using invite token
 *     tags: [Invites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully joined workspace
 */
router.post('/:token/claim', authenticate, claimInvite);

module.exports = router;
