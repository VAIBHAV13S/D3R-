/**
 * Tests for validation utilities
 */

import {
  isValidEmail,
  isValidEthAddress,
  isValidAmount,
  isValidFileSize,
  isValidFileType,
  isValidUrl,
  sanitizeInput,
  validateCampaignForm,
  validateDonationAmount,
} from '../validation';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isValidEthAddress', () => {
    it('should validate correct Ethereum addresses', () => {
      expect(isValidEthAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0')).toBe(true);
    });

    it('should reject invalid Ethereum addresses', () => {
      expect(isValidEthAddress('0x123')).toBe(false);
      expect(isValidEthAddress('invalid')).toBe(false);
      expect(isValidEthAddress('')).toBe(false);
    });
  });

  describe('isValidAmount', () => {
    it('should validate amounts within range', () => {
      expect(isValidAmount(10, 0, 100)).toBe(true);
      expect(isValidAmount(0, 0, 100)).toBe(true);
      expect(isValidAmount(100, 0, 100)).toBe(true);
    });

    it('should reject amounts outside range', () => {
      expect(isValidAmount(-1, 0, 100)).toBe(false);
      expect(isValidAmount(101, 0, 100)).toBe(false);
      expect(isValidAmount('invalid', 0, 100)).toBe(false);
    });
  });

  describe('isValidFileSize', () => {
    it('should validate file size', () => {
      const smallFile = { size: 1024 * 1024 }; // 1MB
      const largeFile = { size: 20 * 1024 * 1024 }; // 20MB

      expect(isValidFileSize(smallFile, 10)).toBe(true);
      expect(isValidFileSize(largeFile, 10)).toBe(false);
    });

    it('should return true for null file', () => {
      expect(isValidFileSize(null, 10)).toBe(true);
    });
  });

  describe('isValidFileType', () => {
    it('should validate file type', () => {
      const imageFile = { type: 'image/png' };
      const pdfFile = { type: 'application/pdf' };

      expect(isValidFileType(imageFile, ['image/png', 'image/jpeg'])).toBe(true);
      expect(isValidFileType(pdfFile, ['image/png', 'image/jpeg'])).toBe(false);
    });

    it('should return true when no types specified', () => {
      const file = { type: 'image/png' };
      expect(isValidFileType(file, [])).toBe(true);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeInput('Hello <World>')).toBe('Hello World');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });

    it('should handle non-string input', () => {
      expect(sanitizeInput(123)).toBe(123);
      expect(sanitizeInput(null)).toBe(null);
    });
  });

  describe('validateCampaignForm', () => {
    it('should validate correct campaign data', () => {
      const data = {
        title: 'Test Campaign',
        targetAmount: 1000,
        deadline: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      };

      const result = validateCampaignForm(data);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject missing title', () => {
      const data = { targetAmount: 1000 };
      const result = validateCampaignForm(data);

      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBeDefined();
    });

    it('should reject invalid target amount', () => {
      const data = { title: 'Test', targetAmount: 0 };
      const result = validateCampaignForm(data);

      expect(result.isValid).toBe(false);
      expect(result.errors.targetAmount).toBeDefined();
    });

    it('should reject past deadline', () => {
      const data = {
        title: 'Test',
        targetAmount: 1000,
        deadline: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      };
      const result = validateCampaignForm(data);

      expect(result.isValid).toBe(false);
      expect(result.errors.deadline).toBeDefined();
    });
  });

  describe('validateDonationAmount', () => {
    it('should validate correct donation amount', () => {
      const result = validateDonationAmount(10);
      expect(result.isValid).toBe(true);
    });

    it('should reject amount below minimum', () => {
      const result = validateDonationAmount(0.0001);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject amount above maximum', () => {
      const result = validateDonationAmount(2000000);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
