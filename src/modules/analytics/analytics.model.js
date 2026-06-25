const mongoose = require('mongoose');

const digestSchema = new mongoose.Schema({
  workspaceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Workspace', 
    required: true 
  },
  week: { 
    type: Number, 
    required: true 
  },
  year: { 
    type: Number, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  totalTasks: { 
    type: Number, 
    default: 0 
  },
  completedTasks: { 
    type: Number, 
    default: 0 
  },
  overdueTasks: { 
    type: Number, 
    default: 0 
  },
  avgPriority: { 
    type: Number, 
    default: 0 
  },
  generatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: false 
});

// Indexes to easily fetch the latest digest for a workspace
digestSchema.index({ workspaceId: 1, year: -1, week: -1 });

module.exports = mongoose.model('Digest', digestSchema);
