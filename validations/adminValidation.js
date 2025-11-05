// validations/adminValidation.js
const { body, param } = require('express-validator');

exports.manageUser = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('action').isIn(['update', 'block', 'unblock', 'delete', 'assign', 'upgrade']),
  body('data').isObject()
];

module.exports = { manageUser };