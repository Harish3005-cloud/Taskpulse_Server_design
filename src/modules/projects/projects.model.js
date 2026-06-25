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
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
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
  }
}, { 
  timestamps: true 
});

// Indexes
projectSchema.index({ workspaceId: 1, name: 1 });
projectSchema.index({ lead: 1 });

module.exports = mongoose.model('Project', projectSchema);
