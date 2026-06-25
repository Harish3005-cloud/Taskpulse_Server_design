const mongoose = require('mongoose');
const env = require('./env');
const { logger } = require('../utils/logger');

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error('MongoDB connection failed:', error.message);
    throw error;
  }
};

module.exports = {
  connectDB,
  mongoose,
};