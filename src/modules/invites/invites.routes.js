const express = require('express');
const { authenticate } = require('../../shared/middleware/auth.middleware');
const {
  validateInvite,
  claimInvite
} = require('./invites.controller');

const router = express.Router();

// Public route to validate token
router.get('/:token', validateInvite);

// Protected route to accept invite
router.post('/:token/accept', authenticate, claimInvite);

module.exports = router;
