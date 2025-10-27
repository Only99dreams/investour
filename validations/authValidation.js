const { body } = require('express-validator');

// Login validation
exports.loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Individual signup validation
exports.individualSignupValidation = [
  body('fullName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters'),
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  body('termsAccepted')
    .equals('true')
    .withMessage('You must accept the terms and conditions')
];

// Group signup validation
exports.groupSignupValidation = [
  body('groupName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Group name must be at least 2 characters'),
  body('groupType')
    .isIn(['Coop', 'NGO', 'School', 'Religious Org', 'Other'])
    .withMessage('Invalid group type'),
  body('contactPerson')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Contact person name must be at least 2 characters'),
  body('contactPhone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('contactEmail')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  body('region')
    .trim()
    .notEmpty()
    .withMessage('Region is required'),
  body('termsAccepted')
    .equals('true')
    .withMessage('You must accept the terms and conditions'),
  body('authorized')
    .equals('true')
    .withMessage('You must confirm you are authorized to register this group')
];

// Firm signup validation
exports.firmSignupValidation = [
  body('firmName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Firm name must be at least 2 characters'),
  body('sector')
    .trim()
    .notEmpty()
    .withMessage('Sector is required'),
  body('countryOfRegistration')
    .trim()
    .notEmpty()
    .withMessage('Country of registration is required'),
  body('contactPerson')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Contact person name must be at least 2 characters'),
  body('contactTitle')
    .trim()
    .notEmpty()
    .withMessage('Contact title is required'),
  body('contactPhone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('businessEmail')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('termsAccepted')
    .equals('true')
    .withMessage('You must accept the terms and conditions'),
  body('licensed')
    .equals('true')
    .withMessage('You must confirm you represent a licensed firm')
];