/**
 * Integration tests for health check endpoints
 */

const request = require('supertest');
const { app } = require('../../server-template');

describe('Health Check Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return 200 and health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('env');
      expect(response.body).toHaveProperty('memory');
    });

    it('should include memory information', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.body.memory).toHaveProperty('used');
      expect(response.body.memory).toHaveProperty('total');
    });
  });

  describe('GET /api/db/health', () => {
    it('should return database health status', async () => {
      const response = await request(app)
        .get('/api/db/health')
        .expect('Content-Type', /json/);

      // May be 200 or 503 depending on DB connection
      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('ok');
    });

    it('should include pool information when connected', async () => {
      const response = await request(app)
        .get('/api/db/health');

      if (response.body.ok) {
        expect(response.body).toHaveProperty('database');
        expect(response.body).toHaveProperty('poolSize');
        expect(response.body).toHaveProperty('idleCount');
        expect(response.body).toHaveProperty('waitingCount');
      }
    });
  });
});
