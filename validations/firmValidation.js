// validations/firmValidation.js
const { body } = require('express-validator');

exports.firmSignup = [
  body('firmName').trim().isLength({ min: 2 }),
  body('sector').trim().notEmpty(),
  body('countryOfRegistration').trim().notEmpty(),
  body('contactPerson').trim().isLength({ min: 2 }),
  body('contactTitle').trim().notEmpty(),
  body('contactPhone').isMobilePhone(),
  body('businessEmail').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('licensed').equals('true'),
  body('termsAccepted').equals('true')
];