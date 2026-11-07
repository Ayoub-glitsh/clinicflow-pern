import request from 'supertest';
import app from '../../app';
import * as authService from '../../services/auth.service';
import { AppError } from '../../utils/AppError';

jest.mock('../../services/auth.service');

describe('POST /api/auth/login', () => {
  it('returns 200 with token on valid credentials', async () => {
    (authService.login as jest.Mock).mockResolvedValue({
      token: 'jwt-token',
      user: { id: 'u1', email: 'admin@test.com', role: 'admin' },
    });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'pass' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBe('jwt-token');
    expect(res.body.user.email).toBe('admin@test.com');
  });

  it('returns 401 on invalid credentials', async () => {
    (authService.login as jest.Mock).mockRejectedValue(
      new AppError(401, 'Invalid email or password')
    );
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bad@test.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('returns 400 on missing email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'pass' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });
});
