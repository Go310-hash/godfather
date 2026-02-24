/**
 * Student routes: public registration + protected CRUD
 */
const express = require('express');
const path = require('path');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { studentRegistrationRules } = require('../utils/validation');

// Public: submit registration (with optional passport upload)
router.post(
  '/',
  upload.single('passportPhoto'),
  studentRegistrationRules,
  studentController.create
);

// Protected routes
router.get('/stats', authenticate, studentController.stats);
router.get('/export/csv', authenticate, studentController.exportCsv);
router.get('/', authenticate, studentController.list);
router.get('/:id', authenticate, studentController.getById);
router.patch('/:id/status', authenticate, studentController.updateStatus);
router.delete('/:id', authenticate, studentController.remove);

module.exports = router;
