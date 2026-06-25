const taskService = require('./tasks.service');
const AppError = require('../../shared/utils/AppError');

/**
 * GET /api/v1/tasks
 * List tasks for a workspace (requires ?workspaceId query parameter)
 */
const listTasks = async (req, res, next) => {
  try {
    const { workspaceId, ...query } = req.query;

    if (!workspaceId) {
      throw new AppError('workspaceId query parameter is required', 400);
    }

    const result = await taskService.listTasks(workspaceId, req.user.id, query);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/tasks/:id
 * Get a specific task
 */
const getTask = async (req, res, next) => {
  try {
    const { workspaceId } = req.query;

    if (!workspaceId) {
      throw new AppError('workspaceId query parameter is required', 400);
    }

    const task = await taskService.getTask(req.params.id, workspaceId, req.user.id);

    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/tasks
 * Create a new task
 */
const createTask = async (req, res, next) => {
  try {
    const { workspaceId, ...taskData } = req.body;

    if (!workspaceId) {
      throw new AppError('workspaceId is required in the body', 400);
    }
    if (!taskData.title) {
      throw new AppError('Task title is required', 400);
    }

    const task = await taskService.createTask(workspaceId, req.user.id, taskData);

    res.status(201).json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/tasks/:id
 * Update an existing task
 */
const updateTask = async (req, res, next) => {
  try {
    const { workspaceId, ...taskData } = req.body;

    if (!workspaceId) {
      throw new AppError('workspaceId is required in the body', 400);
    }

    const task = await taskService.updateTask(req.params.id, workspaceId, req.user.id, taskData);

    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/tasks/:id
 * Soft delete a task
 */
const deleteTask = async (req, res, next) => {
  try {
    const { workspaceId } = req.body;

    if (!workspaceId) {
      throw new AppError('workspaceId is required in the body', 400);
    }

    await taskService.deleteTask(req.params.id, workspaceId, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Task successfully deleted'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/tasks/:id/attachments
 * Get an S3 presigned URL for direct upload
 */
const getPresignedUrl = async (req, res, next) => {
  try {
    const { workspaceId, fileName, fileSize, mimeType } = req.body;

    if (!workspaceId || !fileName || !fileSize || !mimeType) {
      throw new AppError('workspaceId, fileName, fileSize, and mimeType are required', 400);
    }

    const result = await taskService.getPresignedUrl(
      req.params.id,
      workspaceId,
      req.user.id,
      { fileName, fileSize, mimeType }
    );

    res.status(201).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getPresignedUrl
};
