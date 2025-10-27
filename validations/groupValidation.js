// validations/groupValidation.js
const { body } = require('express-validator');

exports.groupSignup = [
  body('groupName').trim().isLength({ min: 2 }),
  body('groupType').isIn(['Coop', 'NGO', 'School', 'Religious Org', 'Other']),
  body('contactPerson').trim().isLength({ min: 2 }),
  body('contactPhone').isMobilePhone(),
  body('contactEmail').isEmail().normalizeEmail(),
  body('country').trim().notEmpty(),
  body('region').trim().notEmpty(),
  body('authorized').equals('true'),
  body('termsAccepted').equals('true')
];