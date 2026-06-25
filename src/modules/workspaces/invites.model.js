const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
  workspaceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Workspace', 
    required: true 
  },
  token: { 
    type: String, 
    required: true, 
    unique: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  expiresAt: { 
    type: Date, 
    required: true 
  },
  claimedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  claimedAt: { 
    type: Date, 
    default: null 
  }
}, { 
  timestamps: { createdAt: true, updatedAt: false } // Only track createdAt natively
});

module.exports = mongoose.model('Invite', inviteSchema);
