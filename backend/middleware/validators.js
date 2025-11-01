/**
 * Input validation and sanitization middleware using express-validator
 */

const { body, param, query, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errorHandler');

/**
 * Middleware to check validation results and throw error if invalid
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => `${err.path}: ${err.msg}`).join(', ');
    throw new ValidationError(errorMessages);
  }
  next();
};

/**
 * Campaign validation rules
 */
const validateCampaign = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters')
    .escape(),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Description must be less than 5000 characters')
    .escape(),
  
  body('targetAmount')
    .notEmpty().withMessage('Target amount is required')
    .isFloat({ min: 1 }).withMessage('Target amount must be greater than 0')
    .toFloat(),
  
  body('deadline')
    .optional()
    .isISO8601().withMessage('Deadline must be a valid date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Deadline must be in the future');
      }
      return true;
    }),
  
  body('disasterId')
    .optional()
    .trim()
    .isLength({ max: 64 }).withMessage('Disaster ID must be less than 64 characters')
    .escape(),
  
  body('imageCID')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Image CID must be less than 100 characters')
    .matches(/^[a-zA-Z0-9]+$/).withMessage('Image CID must be alphanumeric'),
  
  validate,
];

/**
 * Donation validation rules
 */
const validateDonation = [
  body('campaignId')
    .notEmpty().withMessage('Campaign ID is required')
    .isUUID().withMessage('Campaign ID must be a valid UUID'),
  
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.001 }).withMessage('Amount must be at least 0.001')
    .toFloat(),
  
  body('txHash')
    .notEmpty().withMessage('Transaction hash is required')
    .matches(/^0x[a-fA-F0-9]{64}$/).withMessage('Invalid transaction hash format'),
  
  body('donor')
    .optional()
    .trim()
    .matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Invalid Ethereum address'),
  
  body('anonymous')
    .optional()
    .isBoolean().withMessage('Anonymous must be a boolean')
    .toBoolean(),
  
  validate,
];

/**
 * Milestone validation rules
 */
const validateMilestone = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters')
    .escape(),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must be less than 2000 characters')
    .escape(),
  
  body('fundAmount')
    .notEmpty().withMessage('Fund amount is required')
    .isFloat({ min: 0 }).withMessage('Fund amount must be non-negative')
    .toFloat(),
  
  validate,
];

/**
 * User validation rules
 */
const validateUser = [
  body('walletAddress')
    .trim()
    .notEmpty().withMessage('Wallet address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Invalid Ethereum address'),
  
  body('displayName')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Display name must be less than 100 characters')
    .escape(),
  
  validate,
];

/**
 * Wallet address validation (for auth)
 */
const validateWalletAddress = [
  body('walletAddress')
    .trim()
    .notEmpty().withMessage('Wallet address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Invalid Ethereum address'),
  
  validate,
];

/**
 * Signature verification validation
 */
const validateSignature = [
  body('walletAddress')
    .trim()
    .notEmpty().withMessage('Wallet address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Invalid Ethereum address'),
  
  body('signature')
    .trim()
    .notEmpty().withMessage('Signature is required')
    .matches(/^0x[a-fA-F0-9]+$/).withMessage('Invalid signature format'),
  
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required'),
  
  validate,
];

/**
 * UUID parameter validation
 */
const validateUUID = [
  param('id')
    .isUUID().withMessage('Invalid ID format'),
  
  validate,
];

/**
 * Pagination validation
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  validate,
];

/**
 * Campaign filters validation
 */
const validateCampaignFilters = [
  query('status')
    .optional()
    .trim()
    .isIn(['active', 'completed', 'cancelled']).withMessage('Invalid status'),
  
  query('sortBy')
    .optional()
    .trim()
    .isIn(['createdAt', 'targetAmount', 'currentAmount', 'deadline']).withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .trim()
    .isIn(['asc', 'desc']).withMessage('Invalid sort order'),
  
  query('featured')
    .optional()
    .isBoolean().withMessage('Featured must be a boolean')
    .toBoolean(),
  
  ...validatePagination,
];

module.exports = {
  validate,
  validateCampaign,
  validateDonation,
  validateMilestone,
  validateUser,
  validateWalletAddress,
  validateSignature,
  validateUUID,
  validatePagination,
  validateCampaignFilters,
};
