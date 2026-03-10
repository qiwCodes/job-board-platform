const express = require('express');
const { body, param } = require('express-validator');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  getMyApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');

const router = express.Router();

const updateStatusValidators = [
  param('id')
    .isUUID()
    .withMessage('id must be a valid UUID.'),
  body('status')
    .trim()
    .notEmpty()
    .withMessage('status is required.')
    .isIn(['pending', 'reviewed', 'interview', 'rejected', 'hired'])
    .withMessage('status is invalid.'),
];

router.get('/me', authenticate, requireRole('applicant'), getMyApplications);
router.patch(
  '/company/:id/status',
  authenticate,
  requireRole('company'),
  updateStatusValidators,
  validateRequest,
  updateApplicationStatus,
);
router.put(
  '/company/:id/status',
  authenticate,
  requireRole('company'),
  updateStatusValidators,
  validateRequest,
  updateApplicationStatus,
);

module.exports = router;
