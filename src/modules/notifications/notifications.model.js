const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  workspaceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Workspace', 
    required: true 
  },
  type: { 
    type: String, 
    enum: [
      'task_assigned', 
      'task_updated', 
      'task_mention', 
      'project_mention', 
      'comment', 
      'comment_mention', 
      'system'
    ],
    required: true
  },
  title: { 
    type: String, 
    required: true 
  },
  preview: { 
    type: String, 
    required: true 
  },
  
  // Relations
  taskId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Task', 
    default: null 
  },
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    default: null 
  },
  actorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  
  read: { 
    type: Boolean, 
    default: false 
  },
}, { 
  timestamps: true 
});

// Indexes for fast querying
notificationSchema.index({ userId: 1, workspaceId: 1, read: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
