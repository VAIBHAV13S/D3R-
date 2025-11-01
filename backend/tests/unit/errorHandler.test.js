/**
 * Unit tests for error handler utilities
 */

const {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} = require('../../utils/errorHandler');

describe('Error Handler Utilities', () => {
  describe('AppError', () => {
    it('should create error with message and status code', () => {
      const error = new AppError('Test error', 500);
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });

    it('should default to status 500', () => {
      const error = new AppError('Test error');
      
      expect(error.statusCode).toBe(500);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with 400 status', () => {
      const error = new ValidationError('Invalid input');
      
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('AuthenticationError', () => {
    it('should create authentication error with 401 status', () => {
      const error = new AuthenticationError('Not authenticated');
      
      expect(error.message).toBe('Not authenticated');
      expect(error.statusCode).toBe(401);
    });

    it('should use default message', () => {
      const error = new AuthenticationError();
      
      expect(error.message).toBe('Authentication failed');
    });
  });

  describe('AuthorizationError', () => {
    it('should create authorization error with 403 status', () => {
      const error = new AuthorizationError('Not authorized');
      
      expect(error.message).toBe('Not authorized');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with 404 status', () => {
      const error = new NotFoundError('Resource not found');
      
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
    });
  });
});
