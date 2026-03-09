const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const authenticate = require('../middleware/authMiddleware');
const { register, login, getMe } = require('../controllers/authController');

const router = express.Router();

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again later.',
    });
  },
});

const registerValidators = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('name is required.')
    .isLength({ max: 100 })
    .withMessage('name must not exceed 100 characters.'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('email is required.')
    .isEmail()
    .withMessage('email must be valid.')
    .normalizeEmail(),
  body('password')
    .isString()
    .withMessage('password is required.')
    .isLength({ min: 8 })
    .withMessage('password must be at least 8 characters long.'),
  body('role')
    .trim()
    .notEmpty()
    .withMessage('role is required.')
    .isIn(['applicant', 'company'])
    .withMessage('role must be either applicant or company.'),
];

const loginValidators = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('email is required.')
    .isEmail()
    .withMessage('email must be valid.')
    .normalizeEmail(),
  body('password')
    .isString()
    .withMessage('password is required.')
    .notEmpty()
    .withMessage('password is required.'),
];

router.post('/register', authRateLimiter, registerValidators, register);
router.post('/login', authRateLimiter, loginValidators, login);
router.get('/me', authenticate, getMe);

module.exports = router;
