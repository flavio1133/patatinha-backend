const request = require('supertest');
const app = require('../../src/server');

describe('API Health Check - Testes de Integração', () => {
  
  test('GET /api/health deve retornar status 200', async () => {
    const response = await request(app)
      .get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('GET /api/health deve retornar JSON válido', async () => {
    const response = await request(app)
      .get('/api/health');
    
    expect(response.headers['content-type']).toMatch(/json/);
    expect(typeof response.body.status).toBe('string');
    expect(typeof response.body.timestamp).toBe('string');
  });
});
