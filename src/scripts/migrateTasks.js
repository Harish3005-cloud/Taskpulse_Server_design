const mongoose = require('mongoose');
require('dotenv').config();

const Task = require('../modules/tasks/tasks.model');
const Project = require('../modules/projects/projects.model');
const Workspace = require('../modules/workspaces/workspaces.model');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskpulse');
    console.log('Connected to DB');

    const tasksWithoutProject = await Task.find({ projectId: { $exists: false } });
    console.log(`Found ${tasksWithoutProject.length} tasks without a project.`);

    if (tasksWithoutProject.length === 0) {
      console.log('Nothing to migrate.');
      process.exit(0);
    }

    const workspaces = await Workspace.find();
    console.log(`Processing ${workspaces.length} workspaces...`);

    for (const workspace of workspaces) {
      // Find tasks in this workspace
      const tasksInWorkspace = await Task.find({ workspaceId: workspace._id, projectId: { $exists: false } });
      
      if (tasksInWorkspace.length > 0) {
        // Create a default project
        let defaultProject = await Project.findOne({ workspaceId: workspace._id, name: 'Default Project' });
        
        if (!defaultProject) {
          defaultProject = await Project.create({
            workspaceId: workspace._id,
            name: 'Default Project',
            summary: 'Auto-generated default project for legacy tasks',
            lead: workspace.createdBy,
            members: workspace.members.map(m => m.userId)
          });
          console.log(`Created Default Project for workspace ${workspace.name}`);
        }

        // Update tasks
        const result = await Task.updateMany(
          { workspaceId: workspace._id, projectId: { $exists: false } },
          { $set: { projectId: defaultProject._id } }
        );
        console.log(`Migrated ${result.modifiedCount} tasks in workspace ${workspace.name}`);
      }
    }

    console.log('Migration complete.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

run();
