const express = require('express');
const { listUsersController, getUserController } = require('../controllers/userController');

const requireRole = require('../middleware/requireRole');
const router = express.Router();

router.get('/', requireRole(['ADMIN']), listUsersController);
router.get('/:id', requireRole(['ADMIN']), getUserController);

module.exports = router;
