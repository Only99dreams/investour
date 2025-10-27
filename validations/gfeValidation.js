// validations/gfeValidation.js
const { body } = require('express-validator');

exports.gfeAgreement = [
  body('gfeAgreement').equals('true').withMessage('You must agree to GFE terms')
];