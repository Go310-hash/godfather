/**
 * Server-side validation rules (express-validator)
 */
const { body, sanitizeBody } = require('express-validator');

const studentRegistrationRules = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 150 }).withMessage('Name must be 2–150 characters'),
  body('dateOfBirth')
    .notEmpty().withMessage('Date of birth is required')
    .isDate().withMessage('Invalid date'),
  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
  body('classApplyingFor')
    .trim()
    .notEmpty().withMessage('Class is required')
    .isLength({ max: 50 }),
  body('parentGuardianName')
    .trim()
    .notEmpty().withMessage('Parent/Guardian name is required')
    .isLength({ max: 150 }),
  body('phoneNumber')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isLength({ min: 9, max: 20 }).withMessage('Invalid phone length')
    .matches(/^[\d\s\-+()]+$/).withMessage('Invalid phone format'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email')
    .normalizeEmail(),
  body('address')
    .trim()
    .notEmpty().withMessage('Address is required')
    .isLength({ max: 1000 }),
  body('previousSchool').optional().trim().isLength({ max: 255 }),
];

module.exports = { studentRegistrationRules };
