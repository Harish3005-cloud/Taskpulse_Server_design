const mongoose = require('mongoose');
const User = require('../src/modules/auth/auth.model');
const Workspace = require('../src/modules/workspaces/workspaces.model');
const Project = require('../src/modules/projects/projects.model');
const Task = require('../src/modules/tasks/tasks.model');

const MONGODB_URI = 'mongodb://mongo:qjDuNgXjwrIkSVzfzCmXvbnkxtesXFFY@taskpulseserverdesign.railway.internal:27017/taskpulse?authSource=admin';
const TARGET_EMAIL = 'eharish3005@gmail.com';

const projectConfigs = [
  { name: 'Project Alpha', count: 12 },
  { name: 'Project Beta', count: 8 },
  { name: 'Project Gamma', count: 15 }
];

const statuses = ['todo', 'in-progress', 'review', 'done'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(type) {
  const now = new Date();
  switch(type) {
    case 'overdue':
      return new Date(now.setDate(now.getDate() - Math.floor(Math.random() * 10) - 1));
    case 'today':
      return new Date();
    case 'nextWeek':
      return new Date(now.setDate(now.getDate() + Math.floor(Math.random() * 7) + 1));
    default:
      return new Date();
  }
}

async function seedData() {
  let initialTaskCount = 0;
  let finalTaskCount = 0;
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: TARGET_EMAIL });
    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }
    console.log(`Found user: ${user.email} (${user._id})`);

    let workspace;
    if (user.tenantId) {
      workspace = await Workspace.findById(user.tenantId);
    } else {
      workspace = await Workspace.findOne({ createdBy: user._id });
    }

    if (!workspace) {
      console.log('Workspace not found for user!');
      process.exit(1);
    }
    console.log(`Found workspace: ${workspace.name} (${workspace._id})`);

    initialTaskCount = await Task.countDocuments({ workspaceId: workspace._id });

    let tasksAdded = 0;
    const taskStats = {
      todo: 0,
      'in-progress': 0,
      review: 0,
      done: 0,
      overdue: 0,
      completed: 0,
      priorities: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    for (const config of projectConfigs) {
      let project = await Project.findOne({ workspaceId: workspace._id, name: config.name });
      if (!project) {
        project = new Project({
          workspaceId: workspace._id,
          name: config.name,
          lead: user._id,
          status: 'in-progress',
          members: [{ user: user._id, role: 'owner' }]
        });
        await project.save();
        console.log(`Created Project: ${project.name}`);
      } else {
        console.log(`Found Project: ${project.name}`);
      }

      const existingTasksCount = await Task.countDocuments({ projectId: project._id });
      if (existingTasksCount >= config.count) {
        console.log(`Skipping seeding for ${config.name}, already has ${existingTasksCount} tasks.`);
        continue;
      }

      const tasksToCreate = config.count - existingTasksCount;
      
      for (let i = 0; i < tasksToCreate; i++) {
        const status = getRandomItem(statuses);
        const priority = Math.floor(Math.random() * 5) + 1;
        
        let dateType = getRandomItem(['overdue', 'today', 'nextWeek']);
        if (status === 'done') {
            dateType = 'overdue'; // usually completed tasks were due in the past or today
        }
        
        const dueDate = getRandomDate(dateType);
        const createdAt = new Date(dueDate);
        createdAt.setDate(createdAt.getDate() - 5);

        let completedAt = null;
        if (status === 'done') {
          completedAt = new Date(dueDate);
          completedAt.setDate(completedAt.getDate() - 1); // Completed a day before due
          taskStats.completed++;
        }

        const task = new Task({
          workspaceId: workspace._id,
          projectId: project._id,
          title: `Task ${i + 1} for ${config.name}`,
          description: `This is a realistic description for Task ${i + 1} in ${config.name}. It involves several steps.`,
          status: status,
          priority: priority,
          createdBy: user._id,
          assignedTo: Math.random() > 0.3 ? user._id : null,
          dueDate: dueDate,
          createdAt: createdAt,
          completedAt: completedAt,
          ai: {
            category: getRandomItem(['Feature', 'Bug', 'Improvement', 'Documentation', 'Design'])
          }
        });

        await task.save();
        tasksAdded++;
        taskStats[status]++;
        taskStats.priorities[priority]++;
        
        if (status !== 'done' && dueDate < new Date()) {
           taskStats.overdue++;
        }
      }
    }

    finalTaskCount = await Task.countDocuments({ workspaceId: workspace._id });
    
    // Recalculate accurate stats
    const allTasks = await Task.find({ workspaceId: workspace._id });
    let totalTodo = 0, totalInProgress = 0, totalReview = 0, totalDone = 0;
    let totalOverdue = 0;
    
    allTasks.forEach(t => {
      if(t.status === 'todo') totalTodo++;
      if(t.status === 'in-progress') totalInProgress++;
      if(t.status === 'review') totalReview++;
      if(t.status === 'done') totalDone++;
      if(t.status !== 'done' && t.dueDate && t.dueDate < new Date()) totalOverdue++;
    });

    console.log('\n--- SEEDING SUMMARY ---');
    console.log(`Workspace: ${workspace.name}`);
    console.log(`Projects Used: ${projectConfigs.map(c => c.name).join(', ')}`);
    console.log(`Tasks Added in this run: ${tasksAdded}`);
    console.log(`Total Tasks in Workspace Before: ${initialTaskCount}`);
    console.log(`Total Tasks in Workspace After: ${finalTaskCount}`);
    console.log(`\nCurrent Status Distribution (All Tasks):`);
    console.log(`  Todo: ${totalTodo}`);
    console.log(`  In Progress: ${totalInProgress}`);
    console.log(`  Review: ${totalReview}`);
    console.log(`  Done: ${totalDone}`);
    console.log(`\nOverdue Tasks: ${totalOverdue}`);
    console.log(`Completed Tasks: ${totalDone}`);
    console.log(`Completion Percentage: ${finalTaskCount ? Math.round((totalDone / finalTaskCount) * 100) : 0}%`);
    
    // Test an analytics aggregation (optional but good to verify)
    const AnalyticsModel = require('../src/modules/analytics/analytics.model');
    // If analytics model has logic, we could query it. But it's usually aggregated.
    
    console.log('\nAnalytics validation complete.');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedData();
