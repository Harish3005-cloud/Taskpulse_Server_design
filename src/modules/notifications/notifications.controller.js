const notificationService = require('./notifications.service');
const AppError = require('../../shared/utils/AppError');

const getNotifications = async (req, res, next) => {
  try {
    const workspaceId = req.query.workspaceId;
    if (!workspaceId) {
      throw new AppError('workspaceId is required', 400);
    }

    const result = await notificationService.getNotifications(req.user.id, workspaceId, req.query);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      notification
    });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const { workspaceId } = req.body;
    if (!workspaceId) {
      throw new AppError('workspaceId is required', 400);
    }

    await notificationService.markAllAsRead(workspaceId, req.user.id);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
