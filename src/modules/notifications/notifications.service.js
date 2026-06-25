const Notification = require('./notifications.model');
const Workspace = require('../workspaces/workspaces.model');
const User = require('../auth/auth.model');
const AppError = require('../../shared/utils/AppError');

// Helper: fetch all users in a workspace to match mentions
const getWorkspaceMembersMap = async (workspaceId) => {
  const workspace = await Workspace.findById(workspaceId).populate('members.userId');
  if (!workspace) return [];
  return workspace.members.map(m => m.userId);
};

/**
 * Parses text for `@mentions` and creates mention notifications.
 * Supports basic matching on first name or email prefix.
 */
const parseMentionsAndNotify = async (text, workspaceId, actorId, type, title, preview, relations = {}) => {
  if (!text) return;

  const mentionRegex = /@([a-zA-Z0-9._-]+)/g;
  const matches = [...text.matchAll(mentionRegex)].map(m => m[1].toLowerCase());
  
  if (matches.length === 0) return;

  const members = await getWorkspaceMembersMap(workspaceId);
  
  const notifiedIds = new Set();

  for (const match of matches) {
    const matchedUser = members.find(u => {
      if (!u) return false;
      const emailPrefix = u.email ? u.email.split('@')[0].toLowerCase() : '';
      const firstName = u.name ? u.name.split(' ')[0].toLowerCase() : '';
      return emailPrefix === match || firstName === match;
    });

    if (matchedUser && matchedUser._id.toString() !== actorId.toString() && !notifiedIds.has(matchedUser._id.toString())) {
      notifiedIds.add(matchedUser._id.toString());
      await createNotification({
        userId: matchedUser._id,
        workspaceId,
        type,
        title,
        preview,
        actorId,
        ...relations
      });
    }
  }
};

const createNotification = async (data) => {
  const notification = await Notification.create(data);
  
  // TODO: emit socket event here for real-time updates
  // Example:
  // io.to(`user_${data.userId}`).emit('notification_received', notification);

  return notification;
};

const getNotifications = async (userId, workspaceId, query = {}) => {
  const filter = { userId, workspaceId };

  if (query.read !== undefined) {
    filter.read = query.read === 'true';
  }

  if (query.type) {
    filter.type = query.type;
  }

  const limit = parseInt(query.limit, 10) || 50;
  const page = parseInt(query.page, 10) || 1;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find(filter)
    .populate('actorId', 'name email avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Notification.countDocuments(filter);
  const unreadCount = await Notification.countDocuments({ ...filter, read: false });

  return {
    notifications,
    total,
    unreadCount,
    page,
    pages: Math.ceil(total / limit)
  };
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true },
    { new: true }
  );

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  return notification;
};

const markAllAsRead = async (workspaceId, userId) => {
  await Notification.updateMany(
    { workspaceId, userId, read: false },
    { read: true }
  );
  return { success: true };
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  parseMentionsAndNotify
};
