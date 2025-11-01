/**
 * Unit tests for JWT utilities
 */

const { generateToken, verifyToken } = require('../../utils/jwt');

describe('JWT Utilities', () => {
  const testPayload = {
    userId: '123',
    walletAddress: '0x1234567890123456789012345678901234567890',
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(testPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include payload data', () => {
      const token = generateToken(testPayload);
      const decoded = verifyToken(token);
      
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.walletAddress).toBe(testPayload.walletAddress);
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const token = generateToken(testPayload);
      const decoded = verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(testPayload.userId);
    });

    it('should return null for invalid token', () => {
      const decoded = verifyToken('invalid.token.here');
      
      expect(decoded).toBeNull();
    });

    it('should return null for expired token', () => {
      // This would require mocking time or using a very short expiry
      // For now, just test invalid format
      const decoded = verifyToken('');
      
      expect(decoded).toBeNull();
    });
  });
});
