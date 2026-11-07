import request from 'supertest';
import app from '../../app';
import * as dashboardService from '../../services/dashboard.service';
import * as jwtUtils from '../../utils/jwt';

jest.mock('../../services/dashboard.service');
jest.mock('../../utils/jwt');

beforeEach(() => {
  (jwtUtils.verifyToken as jest.Mock).mockReturnValue({ id: 'u1', email: 'a@test.com', role: 'admin' });
});

describe('GET /api/dashboard/stats', () => {
  it('returns all 4 stats with 200', async () => {
    (dashboardService.getStats as jest.Mock).mockResolvedValue({
      totalPatients: 5,
      appointmentsToday: 2,
      pendingCount: 4,
      confirmedCount: 3,
    });
    const res = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', 'Bearer valid');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ totalPatients: 5, appointmentsToday: 2 });
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(401);
  });
});
