const express = require('express');
const { authenticate } = require('../../shared/middleware/auth.middleware');
const {
  createView,
  listViews,
  deleteView
} = require('./views.controller');

const router = express.Router();

router.use(authenticate);

router.post('/', createView);
router.get('/', listViews);
router.delete('/:id', deleteView);

module.exports = router;
