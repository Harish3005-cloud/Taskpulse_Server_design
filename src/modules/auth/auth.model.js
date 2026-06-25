const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  googleId: { 
    type: String, 
    sparse: true,
    unique: true
  },
  displayName: {
    type: String,
    trim: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    default: null
  },
  avatar: { 
    type: String,
    default: null
  },
  plan: { 
    type: String, 
    enum: ['free', 'pro'], 
    default: 'free' 
  },
  onboardingCompleted: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 }, { sparse: true });

module.exports = mongoose.model('User', userSchema);