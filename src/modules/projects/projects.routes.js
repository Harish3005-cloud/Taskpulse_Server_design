const express = require('express');
const { authenticate } = require('../../shared/middleware/auth.middleware');
const {
  createProject,
  listProjects,
  getProject,
  updateProject,
  archiveProject,
  getPresignedUrl
} = require('./projects.controller');

const router = express.Router();

router.use(authenticate);

router.post('/', createProject);
router.get('/', listProjects);
router.get('/:id', getProject);
router.patch('/:id', updateProject);
router.delete('/:id', archiveProject);
router.post('/:id/attachments', getPresignedUrl);

module.exports = router;
