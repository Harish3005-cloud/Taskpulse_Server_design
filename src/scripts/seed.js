const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../modules/auth/auth.model');
const Workspace = require('../modules/workspaces/workspaces.model');
const Project = require('../modules/projects/projects.model');
const Task = require('../modules/tasks/tasks.model');
const View = require('../modules/views/views.model');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskpulse');
    console.log('Connected to DB');

    // 1. Create Users
    const lead = await User.create({
      name: 'Test Lead',
      email: `lead_${Date.now()}@example.com`,
      password: 'Password123!',
      isVerified: true
    });

    const members = await Promise.all([
      User.create({ name: 'Alice', email: `alice_${Date.now()}@example.com`, password: 'Password123!', isVerified: true }),
      User.create({ name: 'Bob', email: `bob_${Date.now()}@example.com`, password: 'Password123!', isVerified: true }),
      User.create({ name: 'Charlie', email: `charlie_${Date.now()}@example.com`, password: 'Password123!', isVerified: true }),
      User.create({ name: 'Diana', email: `diana_${Date.now()}@example.com`, password: 'Password123!', isVerified: true })
    ]);

    // 2. Create Workspace
    const workspace = await Workspace.create({
      name: 'Seed Workspace',
      createdBy: lead._id,
      members: [
        { userId: lead._id, role: 'owner' },
        ...members.map(m => ({ userId: m._id, role: 'member' }))
      ],
      customLabels: ['frontend', 'backend', 'design', 'urgent']
    });

    // 3. Create Projects
    const projectA = await Project.create({
      workspaceId: workspace._id,
      name: 'Project Alpha (Website Redesign)',
      summary: 'Overhaul the corporate website',
      lead: lead._id,
      members: [members[0]._id, members[1]._id]
    });

    const projectB = await Project.create({
      workspaceId: workspace._id,
      name: 'Project Beta (Mobile App)',
      summary: 'Build the new iOS and Android app',
      lead: lead._id,
      members: [members[2]._id, members[3]._id]
    });

    // 4. Create Tasks
    await Task.create([
      {
        workspaceId: workspace._id,
        projectId: projectA._id,
        title: 'Design new landing page',
        summary: 'Create Figma mockups for the new landing page',
        status: 'in-progress',
        priority: 4,
        createdBy: lead._id,
        assignedTo: members[0]._id,
        userLabels: ['design', 'urgent']
      },
      {
        workspaceId: workspace._id,
        projectId: projectA._id,
        title: 'Implement header component',
        status: 'todo',
        priority: 2,
        createdBy: lead._id,
        assignedTo: members[1]._id,
        userLabels: ['frontend']
      },
      {
        workspaceId: workspace._id,
        projectId: projectB._id,
        title: 'Setup React Native project',
        status: 'done',
        priority: 3,
        createdBy: lead._id,
        assignedTo: members[2]._id,
        userLabels: ['frontend']
      },
      {
        workspaceId: workspace._id,
        projectId: projectB._id,
        title: 'Build auth API endpoints',
        status: 'review',
        priority: 5,
        createdBy: lead._id,
        assignedTo: members[3]._id,
        userLabels: ['backend', 'urgent']
      }
    ]);

    // 5. Create a View
    await View.create({
      workspaceId: workspace._id,
      name: 'Urgent Tasks',
      createdBy: lead._id,
      filters: {
        priority: 'high' // Assuming frontend handles 'high' logic
      }
    });

    console.log('Seed complete! Created 1 Lead, 4 Members, 1 Workspace, 2 Projects, 4 Tasks, 1 View.');
    console.log(`Lead Email: ${lead.email}`);
    console.log(`Workspace ID: ${workspace._id}`);
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
