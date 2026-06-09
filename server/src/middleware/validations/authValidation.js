const { body } = require('express-validator');

const updateProfileValidation = [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('courseField').optional().trim(),
];

module.exports = { updateProfileValidation };
