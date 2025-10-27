const { body } = require('express-validator');

exports.createPostValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Post title must be between 5 and 100 characters'),
  body('content')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Post content must be at least 10 characters'),
  body('category')
    .isIn(['Education', 'Finance', 'Climate', 'Investment', 'Advert', 'Scam Alert', 'Announcement'])
    .withMessage('Invalid post category'),
  body('attachments')
    .optional()
    .isArray({ max: 5 })
    .withMessage('You can upload up to 5 attachments'),
  body('attachments.*')
    .isString()
    .withMessage('Attachment must be a valid URL or file path')
];