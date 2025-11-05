const { body } = require('express-validator');

// Define the validation array
const groupSignup = [
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
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid international phone number'),
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
  body('authorized')
    .equals('true')
    .withMessage('You must confirm authorization'),
  body('termsAccepted')
    .equals('true')
    .withMessage('You must agree to Terms & Privacy Policy'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

// ✅ EXPORT IT CORRECTLY
module.exports = {
  groupSignup
};