const express = require('express');
const { body, param, query } = require('express-validator');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const { uploadResume } = require('../middleware/uploadMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  getAllJobs,
  getCompanyJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getJobApplicants,
} = require('../controllers/jobController');
const { applyToJob } = require('../controllers/applicationController');

const router = express.Router();
const JOB_STATUS_VALUES = ['active', 'closed', 'draft'];

const jobIdValidator = [
  param('id')
    .isUUID()
    .withMessage('id must be a valid UUID.'),
];

const listJobsValidators = [
  query('search')
    .optional()
    .isString()
    .withMessage('search must be a string.')
    .trim(),
  query('location')
    .optional()
    .isString()
    .withMessage('location must be a string.')
    .trim(),
  query('type')
    .optional()
    .isString()
    .withMessage('type must be a string.')
    .trim(),
  query('salary_min')
    .optional()
    .isInt({ min: 0 })
    .withMessage('salary_min must be a non-negative integer.'),
  query('salary_max')
    .optional()
    .isInt({ min: 0 })
    .withMessage('salary_max must be a non-negative integer.'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer.'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100.'),
];

const companyJobsValidators = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100.'),
  query('status')
    .optional()
    .isString()
    .withMessage('status must be a string.')
    .trim(),
];

const createJobValidators = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('title is required.')
    .isLength({ max: 255 })
    .withMessage('title must not exceed 255 characters.'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('description is required.'),
  body('requirements')
    .optional()
    .isString()
    .withMessage('requirements must be a string.'),
  body('location')
    .optional()
    .isString()
    .withMessage('location must be a string.')
    .isLength({ max: 100 })
    .withMessage('location must not exceed 100 characters.'),
  body('salary_min')
    .optional()
    .isInt({ min: 0 })
    .withMessage('salary_min must be a non-negative integer.'),
  body('salary_max')
    .optional()
    .isInt({ min: 0 })
    .withMessage('salary_max must be a non-negative integer.'),
  body('employment_type')
    .optional()
    .isString()
    .withMessage('employment_type must be a string.'),
  body('status')
    .optional()
    .isString()
    .withMessage('status must be a string.')
    .isIn(JOB_STATUS_VALUES)
    .withMessage('status is invalid.'),
];

const updateJobValidators = [
  ...jobIdValidator,
  body('title')
    .optional()
    .isString()
    .withMessage('title must be a string.')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('title must be between 1 and 255 characters.'),
  body('description')
    .optional()
    .isString()
    .withMessage('description must be a string.')
    .trim()
    .isLength({ min: 1 })
    .withMessage('description must not be empty.'),
  body('requirements')
    .optional()
    .isString()
    .withMessage('requirements must be a string.'),
  body('location')
    .optional()
    .isString()
    .withMessage('location must be a string.')
    .isLength({ max: 100 })
    .withMessage('location must not exceed 100 characters.'),
  body('salary_min')
    .optional()
    .isInt({ min: 0 })
    .withMessage('salary_min must be a non-negative integer.'),
  body('salary_max')
    .optional()
    .isInt({ min: 0 })
    .withMessage('salary_max must be a non-negative integer.'),
  body('employment_type')
    .optional()
    .isString()
    .withMessage('employment_type must be a string.'),
  body('status')
    .optional()
    .isString()
    .withMessage('status must be a string.')
    .isIn(JOB_STATUS_VALUES)
    .withMessage('status is invalid.'),
];

const applyValidators = [
  body('cover_letter')
    .optional()
    .isString()
    .withMessage('cover_letter must be a string.'),
];

router.get('/', listJobsValidators, validateRequest, getAllJobs);
router.get('/company/me', authenticate, requireRole('company'), companyJobsValidators, validateRequest, getCompanyJobs);
router.get('/:id/applications', authenticate, requireRole('company'), jobIdValidator, validateRequest, getJobApplicants);
router.post(
  '/:id/apply',
  authenticate,
  requireRole('applicant'),
  jobIdValidator,
  validateRequest,
  uploadResume,
  applyValidators,
  validateRequest,
  applyToJob,
);
router.get('/:id', jobIdValidator, validateRequest, getJobById);
router.post('/', authenticate, requireRole('company'), createJobValidators, validateRequest, createJob);
router.put('/:id', authenticate, requireRole('company'), updateJobValidators, validateRequest, updateJob);
router.delete('/:id', authenticate, requireRole('company'), jobIdValidator, validateRequest, deleteJob);

module.exports = router;
