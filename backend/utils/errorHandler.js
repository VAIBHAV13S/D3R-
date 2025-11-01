// Centralized error handling utilities

const logger = require('./logger');

class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

function handleError(err, req, res, next) {
  const { statusCode = 500, message } = err;
  const isProduction = process.env.NODE_ENV === 'production';

  const response = {
    error: err.name || 'Error',
    message: message || 'Internal Server Error',
  };

  if (!isProduction && err.stack) {
    response.stack = err.stack;
  }

  // Log error
  logger.logError(err, {
    statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  res.status(statusCode).json(response);
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  handleError,
};
