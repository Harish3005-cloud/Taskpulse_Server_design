const mongoose = require('mongoose');

const viewSchema = new mongoose.Schema({
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
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  filters: {
    status: { type: String, default: 'all' },
    priority: { type: String, default: 'any' },
    category: { type: String, default: 'any' },
    assignee: { type: String, default: 'any' },
    projectId: { type: String, default: 'any' }
  }
}, { 
  timestamps: true 
});

viewSchema.index({ workspaceId: 1, createdBy: 1 });

module.exports = mongoose.model('View', viewSchema);
