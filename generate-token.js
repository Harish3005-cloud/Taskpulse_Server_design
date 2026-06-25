require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/modules/auth/auth.model');
const Workspace = require('./src/modules/workspaces/workspaces.model');
const authService = require('./src/modules/auth/auth.service');

// Default local connection string if not in .env
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskpulse';

async function generateTestToken() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);

    const testEmail = 'tester@taskpulse.com';
    
    // 1. Find or create a test user
    let user = await User.findOne({ email: testEmail });
    if (!user) {
      console.log('Creating new test user...');
      user = await User.create({
        email: testEmail,
        name: 'Test User',
        displayName: 'Tester',
        onboardingCompleted: true
      });
    }

    // 2. Ensure they have a workspace
    let workspace = await Workspace.findOne({ createdBy: user._id });
    if (!workspace) {
      console.log('Creating test workspace...');
      workspace = await Workspace.create({
        name: 'Test Workspace',
        createdBy: user._id,
        members: [{ userId: user._id, role: 'owner' }]
      });
      // Optionally link it to the user's tenantId if you're using that logic
      user.tenantId = workspace._id;
      await user.save();
    }

    // 3. Generate tokens
    console.log('Generating JWT...');
    const { accessToken } = await authService.generateTokens(user._id, user.email, user.tenantId);

    console.log('\n=================================================');
    console.log('✅ TEST DATA GENERATED SUCCESSFULLY');
    console.log('=================================================\n');
    console.log(`WORKSPACE ID : ${workspace._id}\n`);
    console.log(`ACCESS TOKEN : \n${accessToken}\n`);
    console.log('=================================================');
    console.log('Use this token in your Authorization header as: Bearer <token>\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

generateTestToken();
