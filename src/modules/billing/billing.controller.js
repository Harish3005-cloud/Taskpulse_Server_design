const Razorpay = require('razorpay');
const crypto = require('crypto');
const AppError = require('../../shared/utils/AppError');
const User = require('../auth/auth.model');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

/**
 * POST /api/v1/billing/orders
 * Create a Razorpay order
 */
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount } = req.body; // amount in paise

    if (!amount) {
      throw new AppError('Amount is required', 400);
    }

    const options = {
      amount,
      currency: "INR",
      receipt: `rcpt_${req.user.id.substring(0, 10)}_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    res.status(201).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/billing/webhook/razorpay
 * Handle Razorpay webhooks
 */
const handleRazorpayWebhook = async (req, res, next) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || 'dummy_webhook_secret';
    const signature = req.headers['x-razorpay-signature'];
    
    // Express JSON parser creates req.body, but Razorpay signature requires raw string.
    // For simplicity in this demo we use JSON.stringify but in production, use raw body.
    const bodyString = JSON.stringify(req.body);

    const expectedSignature = crypto.createHmac('sha256', secret)
                                    .update(bodyString)
                                    .digest('hex');

    if (expectedSignature !== signature) {
      throw new AppError('Invalid signature', 400);
    }

    // Process event
    const event = req.body;
    if (event.event === 'payment.captured') {
      console.log('Payment captured:', event.payload.payment.entity.id);
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/billing/user/plan
 * Update user plan (e.g., after successful frontend checkout verification)
 */
const updateUserPlan = async (req, res, next) => {
  try {
    const { plan } = req.body;
    if (!['free', 'pro'].includes(plan)) {
      throw new AppError('Invalid plan', 400);
    }

    const user = await User.findByIdAndUpdate(req.user.id, { plan }, { new: true }).select('-__v');
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRazorpayOrder,
  handleRazorpayWebhook,
  updateUserPlan
};
