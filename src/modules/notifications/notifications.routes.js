const express = require('express');
const { authenticate } = require('../../shared/middleware/auth.middleware');
const notificationsController = require('./notifications.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', notificationsController.getNotifications);
router.patch('/read-all', notificationsController.markAllAsRead);
router.patch('/:id/read', notificationsController.markAsRead);

module.exports = router;
