const mongoose = require('mongoose');

const taskAiSchema = new mongoose.Schema({
  priority: { 
    type: Number, 
    min: 0, 
    max: 10,
    default: null
  },
  urgency: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  deadline: { type: String },
  category: { type: String },
  reasoning: { type: String }
}, { _id: false });

const taskAttachmentSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  workspaceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Workspace', 
    required: true 
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true // After migration, this will be strictly enforced
  },
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  summary: {
    type: String,
    default: ''
  },
  description: { 
    type: String,
    default: ''
  },
  status: { 
    type: String, 
    enum: ['todo', 'in-progress', 'review', 'done'],
    default: 'todo'
  },
  priority: { 
    type: Number,
    min: 1,
    max: 5,
    default: 3 // manual priority
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null
  },
  dueDate: { 
    type: Date,
    default: null
  },
  completedAt: { 
    type: Date,
    default: null
  },
  archivedAt: { 
    type: Date,
    default: null // soft delete
  },
  ai: { 
    type: taskAiSchema,
    default: () => ({})
  },
  userLabels: {
    type: [String],
    default: []
  },
  attachments: [taskAttachmentSchema]
}, { 
  timestamps: true 
});

// Indexes for common queries
taskSchema.index({ workspaceId: 1, status: 1 });
taskSchema.index({ workspaceId: 1, assignedTo: 1 });
taskSchema.index({ workspaceId: 1, createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);
