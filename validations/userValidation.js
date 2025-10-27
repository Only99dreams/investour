// validations/userValidation.js
const { body } = require('express-validator');
const User = require('../models/User');
const Group = require('../models/Group');
const Firm = require('../models/Firm');

// ======================
// INDIVIDUAL USER VALIDATION
// ======================

const validateIndividualSignup = [
  // Full Name
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  // Phone Number
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid international phone number (e.g., +2348012345678)'),

  // Email
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) {
        return Promise.reject('Email already in use by an individual');
      }
      const group = await Group.findOne({ contactEmail: email });
      if (group) {
        return Promise.reject('Email already in use by a group');
      }
      const firm = await Firm.findOne({ businessEmail: email });
      if (firm) {
        return Promise.reject('Email already in use by a firm');
      }
    }),

  // Password
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  // Country of Residence
  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country of residence is required'),

  // Gender
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other', 'Prefer not to say'])
    .withMessage('Invalid gender selection'),

  // Disability Status
  body('disability')
    .optional()
    .isIn(['Yes', 'No', 'Prefer not to say'])
    .withMessage('Invalid disability status'),

  // Referral Code
  body('referralCode')
    .optional()
    .isString()
    .withMessage('Referral code must be a string'),

  // CAPTCHA
  body('recaptchaToken')
    .notEmpty()
    .withMessage('CAPTCHA verification is required'),

  // Terms Agreement
  body('termsAccepted')
    .equals('true')
    .withMessage('You must agree to the Terms & Privacy Policy'),

  // Honeypot Field (bot trap)
  body('website')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        throw new Error('Bot detected');
      }
      return true;
    })
];

// ======================
// GROUP USER VALIDATION
// ======================

const validateGroupSignup = [
  // Group Name
  body('groupName')
    .trim()
    .notEmpty()
    .withMessage('Group name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Group name must be between 2 and 100 characters'),

  // Group Type
  body('groupType')
    .notEmpty()
    .withMessage('Group type is required')
    .isIn(['Coop', 'NGO', 'School', 'Religious Org', 'Other'])
    .withMessage('Invalid group type'),

  // Contact Person Full Name
  body('contactPerson')
    .trim()
    .notEmpty()
    .withMessage('Contact person name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Contact person name must be between 2 and 100 characters'),

  // Contact Phone Number
  body('contactPhone')
    .notEmpty()
    .withMessage('Contact phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid international phone number'),

  // Contact Email
  body('contactEmail')
    .notEmpty()
    .withMessage('Contact email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) {
        return Promise.reject('Email already in use by an individual');
      }
      const group = await Group.findOne({ contactEmail: email });
      if (group) {
        return Promise.reject('Email already in use by another group');
      }
      const firm = await Firm.findOne({ businessEmail: email });
      if (firm) {
        return Promise.reject('Email already in use by a firm');
      }
    }),

  // Country
  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),

  // Region/Community
  body('region')
    .trim()
    .notEmpty()
    .withMessage('Region/Community is required'),

  // Referral Code
  body('referralCode')
    .optional()
    .isString()
    .withMessage('Referral code must be a string'),

  // Authorization Confirmation
  body('authorized')
    .equals('true')
    .withMessage('You must confirm you are authorized to register this group'),

  // Terms Agreement
  body('termsAccepted')
    .equals('true')
    .withMessage('You must agree to the Terms & Privacy Policy'),

  // CAPTCHA
  body('recaptchaToken')
    .notEmpty()
    .withMessage('CAPTCHA verification is required'),

  // Honeypot Field
  body('company_website')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        throw new Error('Bot detected');
      }
      return true;
    })
];

// ======================
// FIRM USER VALIDATION
// ======================

const validateFirmSignup = [
  // Firm/Company Name
  body('firmName')
    .trim()
    .notEmpty()
    .withMessage('Firm name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Firm name must be between 2 and 100 characters'),

  // Sector
  body('sector')
    .trim()
    .notEmpty()
    .withMessage('Sector is required'),

  // Country of Registration
  body('countryOfRegistration')
    .trim()
    .notEmpty()
    .withMessage('Country of registration is required'),

  // Contact Person Full Name
  body('contactPerson')
    .trim()
    .notEmpty()
    .withMessage('Contact person name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Contact person name must be between 2 and 100 characters'),

  // Contact Title/Position
  body('contactTitle')
    .trim()
    .notEmpty()
    .withMessage('Contact title/position is required'),

  // Contact Phone
  body('contactPhone')
    .notEmpty()
    .withMessage('Contact phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid international phone number'),

  // Business Email
  body('businessEmail')
    .notEmpty()
    .withMessage('Business email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) {
        return Promise.reject('Email already in use by an individual');
      }
      const group = await Group.findOne({ contactEmail: email });
      if (group) {
        return Promise.reject('Email already in use by a group');
      }
      const firm = await Firm.findOne({ businessEmail: email });
      if (firm) {
        return Promise.reject('Email already in use by another firm');
      }
    }),

  // Password
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  // Licensed Firm Confirmation
  body('licensed')
    .equals('true')
    .withMessage('You must confirm you represent a licensed firm'),

  // Terms Agreement
  body('termsAccepted')
    .equals('true')
    .withMessage('You must agree to the Terms & Privacy Policy'),

  // CAPTCHA
  body('recaptchaToken')
    .notEmpty()
    .withMessage('CAPTCHA verification is required'),

  // Honeypot Field
  body('website')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        throw new Error('Bot detected');
      }
      return true;
    })
];

// ======================
// PROFILE COMPLETION VALIDATION
// ======================

const validateIndividualProfileCompletion = [
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date (YYYY-MM-DD)'),
  
  body('residentialAddress')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Residential address must be at least 10 characters'),
  
  body('occupation')
    .optional()
    .isString()
    .withMessage('Occupation must be a string'),
  
  body('sector')
    .optional()
    .isString()
    .withMessage('Sector must be a string'),
  
  body('institution')
    .optional()
    .isString()
    .withMessage('Institution must be a string'),
  
  body('languagesSpoken')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Languages spoken must be an array with at least one language'),
  
  body('languagesSpoken.*')
    .isString()
    .withMessage('Each language must be a string'),
  
  body('whySigningUp')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one reason for signing up is required'),
  
  body('whySigningUp.*')
    .isIn([
      'To learn about money and investing',
      'To protect myself from scams',
      'To access safe investment opportunities',
      'To learn about climate resilience',
      'To learn and make money as a Grassroots Financial Educator - GFE'
    ])
    .withMessage('Invalid reason for signing up')
];

const validateGroupProfileCompletion = [
  body('address')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Group address must be at least 10 characters'),
  
  body('size')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Group size must be a positive number'),
  
  body('languagePreference')
    .optional()
    .isString()
    .withMessage('Language preference must be a string'),
  
  body('whySigningUp')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one reason for signing up is required'),
  
  body('whySigningUp.*')
    .isIn([
      'To learn about money and investing',
      'To protect myself from scams',
      'To access safe investment opportunities',
      'To learn about climate resilience',
      'To learn and make money as a Grassroots Financial Educator - GFE'
    ])
    .withMessage('Invalid reason for signing up')
];

const validateFirmProfileCompletion = [
  body('licenseNumber')
    .optional()
    .isString()
    .withMessage('License number must be a string'),
  
  body('licenseIssuingBody')
    .optional()
    .isString()
    .withMessage('License issuing body must be a string'),
  
  body('licenseDocument')
    .optional()
    .isURL()
    .withMessage('License document must be a valid URL'),
  
  body('logo')
    .optional()
    .isURL()
    .withMessage('Logo must be a valid URL'),
  
  body('description')
    .optional()
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),
  
  body('address')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Address must be at least 10 characters'),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Website must be a valid URL'),
  
  body('sectorFocus')
    .optional()
    .isString()
    .withMessage('Sector focus must be a string')
];

// ======================
// EXPORTS
// ======================

module.exports = {
  // Signup validations
  validateIndividualSignup,
  validateGroupSignup,
  validateFirmSignup,
  
  // Profile completion validations
  validateIndividualProfileCompletion,
  validateGroupProfileCompletion,
  validateFirmProfileCompletion
};