import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth';

describe('Auth Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
        first_name: 'Test',
        last_name: 'User',
        role: 'individual',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });
});
