import request from 'supertest';
import app from '../../app';
import * as patientsService from '../../services/patients.service';
import * as jwtUtils from '../../utils/jwt';

jest.mock('../../services/patients.service');
jest.mock('../../utils/jwt');

const adminToken = 'Bearer admin-jwt';
const staffToken = 'Bearer staff-jwt';

beforeEach(() => {
  (jwtUtils.verifyToken as jest.Mock).mockImplementation((token: string) => {
    if (token === 'admin-jwt') return { id: 'u1', email: 'admin@test.com', role: 'admin' };
    if (token === 'staff-jwt') return { id: 'u2', email: 'staff@test.com', role: 'staff' };
    throw new Error('invalid token');
  });
});

describe('POST /api/patients', () => {
  it('returns 201 on valid patient creation', async () => {
    const patient = {
      id: 'p1',
      fullName: 'John Doe',
      cin: 'AB123',
      birthDate: '1990-01-01',
      phone: '0600000000',
      createdAt: new Date().toISOString(),
      deletedAt: null,
    };
    (patientsService.createPatient as jest.Mock).mockResolvedValue(patient);
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', adminToken)
      .send({ fullName: 'John Doe', cin: 'AB123', birthDate: '1990-01-01', phone: '0600000000' });
    expect(res.status).toBe(201);
  });

  it('returns 400 on missing required fields', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', adminToken)
      .send({ fullName: 'John' });
    expect(res.status).toBe(400);
    expect(res.body.details).toBeDefined();
  });
});

describe('DELETE /api/patients/:id', () => {
  it('returns 403 for staff users', async () => {
    const res = await request(app)
      .delete('/api/patients/p1')
      .set('Authorization', staffToken);
    expect(res.status).toBe(403);
  });

  it('returns 200 for admin users', async () => {
    (patientsService.softDeletePatient as jest.Mock).mockResolvedValue({});
    const res = await request(app)
      .delete('/api/patients/p1')
      .set('Authorization', adminToken);
    expect(res.status).toBe(200);
  });
});

describe('GET /api/patients', () => {
  it('returns paginated list', async () => {
    (patientsService.getPatients as jest.Mock).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });
    const res = await request(app)
      .get('/api/patients')
      .set('Authorization', adminToken);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total');
  });
});
