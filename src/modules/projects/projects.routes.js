const express = require('express');
const { authenticate } = require('../../shared/middleware/auth.middleware');
const {
  createProject,
  listProjects,
  getProject,
  updateProject,
  archiveProject,
  getPresignedUrl,
  listSharedProjects,
  inviteMember,
  removeMember
} = require('./projects.controller');

const router = express.Router();

router.use(authenticate);

router.post('/', createProject);
router.get('/', listProjects);
router.get('/shared', listSharedProjects);
router.get('/:id', getProject);
router.patch('/:id', updateProject);
router.delete('/:id', archiveProject);
router.post('/:id/attachments', getPresignedUrl);
router.post('/:id/invite', inviteMember);
router.delete('/:id/members/:userId', removeMember);

module.exports = router;
