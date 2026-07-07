const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  workspaceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Workspace', 
    required: true 
  },
  name: { 
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
  lead: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  members: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, default: 'member' },
    joinedAt: { type: Date, default: Date.now }
  }],
  startDate: { 
    type: Date,
    default: null
  },
  targetDate: { 
    type: Date,
    default: null
  },
  labels: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'review', 'done'],
    default: 'todo'
  },
  archivedAt: { 
    type: Date,
    default: null
  },
  attachments: [{
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number },
    mimeType: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }]
}, { 
  timestamps: true 
});

// Indexes
projectSchema.index({ workspaceId: 1, name: 1 });
projectSchema.index({ lead: 1 });

module.exports = mongoose.model('Project', projectSchema);
