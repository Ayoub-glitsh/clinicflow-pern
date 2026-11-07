import request from 'supertest';
import app from '../../app';
import * as appointmentsService from '../../services/appointments.service';
import * as jwtUtils from '../../utils/jwt';

jest.mock('../../services/appointments.service');
jest.mock('../../utils/jwt');

beforeEach(() => {
  (jwtUtils.verifyToken as jest.Mock).mockReturnValue({ id: 'u1', email: 'admin@test.com', role: 'admin' });
});

describe('POST /api/appointments', () => {
  it('returns 201 on valid appointment', async () => {
    const appt = {
      id: 'a1',
      patientId: 'p1',
      appointmentDate: new Date().toISOString(),
      status: 'pending',
      createdBy: 'u1',
      notes: null,
      createdAt: new Date().toISOString(),
    };
    (appointmentsService.createAppointment as jest.Mock).mockResolvedValue(appt);
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', 'Bearer valid')
      .send({ patientId: '550e8400-e29b-41d4-a716-446655440000', appointmentDate: '2024-06-01T10:00:00.000Z' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
  });

  it('returns 400 on missing patientId', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', 'Bearer valid')
      .send({ appointmentDate: '2024-06-01T10:00:00.000Z' });
    expect(res.status).toBe(400);
  });

  it('returns 400 on invalid status query param', async () => {
    const res = await request(app)
      .get('/api/appointments?status=invalid')
      .set('Authorization', 'Bearer valid');
    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/appointments/:id/status', () => {
  it('returns 200 on valid status update', async () => {
    (appointmentsService.updateAppointmentStatus as jest.Mock).mockResolvedValue({
      id: 'a1',
      status: 'confirmed',
    });
    const res = await request(app)
      .patch('/api/appointments/a1/status')
      .set('Authorization', 'Bearer valid')
      .send({ status: 'confirmed' });
    expect(res.status).toBe(200);
  });

  it('returns 400 on invalid status value', async () => {
    const res = await request(app)
      .patch('/api/appointments/a1/status')
      .set('Authorization', 'Bearer valid')
      .send({ status: 'invalid-status' });
    expect(res.status).toBe(400);
  });
});
