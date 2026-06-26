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
  },
  password: {
    type: String,
    select: false // Do not include in queries by default
  }
}, { 
  timestamps: true 
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(candidatePassword, this.password);
};

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 }, { sparse: true });

module.exports = mongoose.model('User', userSchema);