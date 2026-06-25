const express = require('express');
const { authenticate } = require('../../shared/middleware/auth.middleware');
const { 
  createRazorpayOrder, 
  handleRazorpayWebhook, 
  updateUserPlan 
} = require('./billing.controller');

const router = express.Router();

/**
 * @swagger
 * /billing/webhook/razorpay:
 *   post:
 *     summary: Handle Razorpay webhook events
 *     tags: [Billing]
 *     responses:
 *       200:
 *         description: Webhook received
 */
// Webhook must be public to receive events from Razorpay
router.post('/webhook/razorpay', handleRazorpayWebhook);

// The following routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /billing/orders:
 *   post:
 *     summary: Create a Razorpay order
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount in paise
 *     responses:
 *       201:
 *         description: Order created
 */
router.post('/orders', createRazorpayOrder);

/**
 * @swagger
 * /billing/user/plan:
 *   patch:
 *     summary: Update the authenticated user's plan
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [plan]
 *             properties:
 *               plan:
 *                 type: string
 *                 enum: [free, pro]
 *     responses:
 *       200:
 *         description: Plan updated
 */
router.patch('/user/plan', updateUserPlan);

module.exports = router;
