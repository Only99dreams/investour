// validations/investmentValidation.js
const { body } = require('express-validator');

exports.createInvestment = [
  body('title').trim().isLength({ min: 5 }),
  body('category').isIn(['Agric', 'Energy', 'Real Estate', 'Tech', 'Other']),
  body('minimumAmount').isNumeric().toFloat().isFloat({ min: 1 }),
  body('expectedROI').isNumeric().toFloat().isFloat({ min: 0 }),
  body('duration').trim().notEmpty(),
  body('paymentFrequency').isIn(['Monthly', 'Quarterly', 'Annually', 'One-time']),
  body('riskLevel').isIn(['Low', 'Medium', 'High']),
  body('description').trim().isLength({ min: 20 })
];