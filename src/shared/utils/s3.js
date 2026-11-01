const Workspace = require('../../modules/workspaces/workspaces.model');
const mongoose = require('mongoose');
const AppError = require('./AppError');

/**
 * Generates a safe workspace folder name for S3 uploads.
 * @param {string} workspaceId - The MongoDB ObjectId of the workspace.
 * @returns {Promise<string>} The safe folder name.
 */
const getWorkspaceS3Folder = async (workspaceId) => {
  if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
    throw new AppError('Invalid workspaceId', 400);
  }

  const safeWorkspaceId = new mongoose.Types.ObjectId(workspaceId).toString();
  const workspace = await Workspace.findById(safeWorkspaceId).select('name');
  if (!workspace) {
    throw new AppError('Workspace not found', 404);
  }
  
  // Replace spaces with hyphens, remove everything that isn't alphanumeric, hyphen, or underscore
  let safeName = workspace.name
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-_]/g, '');
    
  if (!safeName) {
    safeName = 'workspace';
  }
    
  return `${safeName}_${safeWorkspaceId}`;
};

module.exports = {
  getWorkspaceS3Folder
};
