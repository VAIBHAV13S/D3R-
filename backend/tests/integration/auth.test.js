/**
 * Integration tests for authentication endpoints
 */

const request = require('supertest');
const { app } = require('../../server-template');

describe('Authentication Endpoints', () => {
  const testWallet = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

  describe('POST /api/auth/nonce', () => {
    it('should generate nonce for valid wallet address', async () => {
      const response = await request(app)
        .post('/api/auth/nonce')
        .send({ walletAddress: testWallet })
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('nonce');
      expect(typeof response.body.nonce).toBe('string');
    });

    it('should return 400 for missing wallet address', async () => {
      const response = await request(app)
        .post('/api/auth/nonce')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for invalid wallet address', async () => {
      const response = await request(app)
        .post('/api/auth/nonce')
        .send({ walletAddress: 'invalid-address' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/verify', () => {
    it('should return 400 for missing parameters', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for missing nonce', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({
          walletAddress: testWallet,
          signature: '0x123',
          message: 'test',
        })
        .expect(400);

      expect(response.body.error).toMatch(/nonce/i);
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit after 5 requests', async () => {
      // Make 6 requests
      for (let i = 0; i < 6; i++) {
        const response = await request(app)
          .post('/api/auth/nonce')
          .send({ walletAddress: testWallet });

        if (i < 5) {
          expect(response.status).toBe(200);
        } else {
          expect(response.status).toBe(429);
        }
      }
    }, 10000); // Increase timeout for rate limiting test
  });
});
