const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['owner', 'admin', 'member'], 
    default: 'member' 
  },
  joinedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { _id: false });

const workspaceSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  timezone: { 
    type: String, 
    default: 'UTC' 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  members: [memberSchema],
  settings: {
    digestEnabled: { type: Boolean, default: true },
    digestDay: { type: String, default: 'monday' },
    digestHour: { type: Number, default: 9 }
  },
  customLabels: {
    type: [String],
    default: []
  },
  apiKey: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  plan: { 
    type: String, 
    enum: ['free', 'pro'], 
    default: 'free' 
  },
  archivedAt: { 
    type: Date, 
    default: null 
  }
}, { 
  timestamps: true 
});

// Indexes
workspaceSchema.index({ createdBy: 1 });
workspaceSchema.index({ 'members.userId': 1 });
workspaceSchema.index({ apiKey: 1 }, { sparse: true });

module.exports = mongoose.model('Workspace', workspaceSchema);