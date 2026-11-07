import * as appointmentsService from '../../services/appointments.service';
import { prisma } from '../../prisma/client';
import { AppError } from '../../utils/AppError';

jest.mock('../../prisma/client', () => ({
  prisma: {
    appointment: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    patient: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const BASE_DATE = new Date('2024-06-01T10:00:00.000Z');

describe('appointments conflict rule', () => {
  const existingConfirmed = {
    id: 'a0',
    patientId: 'p1',
    status: 'confirmed',
    appointmentDate: BASE_DATE,
  };

  it('rejects appointment within 29 minutes of confirmed appointment', async () => {
    // 29 min offset → conflict
    const conflictDate = new Date(BASE_DATE.getTime() + 29 * 60 * 1000);

    // Mock patient exists
    (prisma.patient.findFirst as jest.Mock).mockResolvedValue({ id: 'p1', deletedAt: null });

    // Mock transaction: returns conflict
    (prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) => {
      const txMock = {
        appointment: {
          findFirst: jest.fn().mockResolvedValue(existingConfirmed),
          create: jest.fn(),
        },
      };
      return fn(txMock);
    });

    await expect(appointmentsService.createAppointment(
      { patientId: 'p1', appointmentDate: conflictDate.toISOString() },
      'u1'
    )).rejects.toMatchObject({ statusCode: 409 });
  });

  it('accepts appointment exactly 30 minutes after confirmed (boundary)', async () => {
    // exactly 30 min → NOT a conflict
    const exactDate = new Date(BASE_DATE.getTime() + 30 * 60 * 1000);

    (prisma.patient.findFirst as jest.Mock).mockResolvedValue({ id: 'p1', deletedAt: null });

    const newAppt = {
      id: 'a1',
      patientId: 'p1',
      appointmentDate: exactDate,
      status: 'pending',
      createdBy: 'u1',
      notes: null,
      createdAt: new Date(),
    };
    (prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) => {
      const txMock = {
        appointment: {
          findFirst: jest.fn().mockResolvedValue(null), // no conflict at exact boundary
          create: jest.fn().mockResolvedValue(newAppt),
        },
      };
      return fn(txMock);
    });

    const result = await appointmentsService.createAppointment(
      { patientId: 'p1', appointmentDate: exactDate.toISOString() },
      'u1'
    );
    expect(result.status).toBe('pending');
  });

  it('accepts appointment 31 minutes after confirmed', async () => {
    const safeDate = new Date(BASE_DATE.getTime() + 31 * 60 * 1000);

    (prisma.patient.findFirst as jest.Mock).mockResolvedValue({ id: 'p1', deletedAt: null });

    const newAppt = {
      id: 'a2',
      patientId: 'p1',
      appointmentDate: safeDate,
      status: 'pending',
      createdBy: 'u1',
      notes: null,
      createdAt: new Date(),
    };
    (prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) => {
      const txMock = {
        appointment: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue(newAppt),
        },
      };
      return fn(txMock);
    });

    const result = await appointmentsService.createAppointment(
      { patientId: 'p1', appointmentDate: safeDate.toISOString() },
      'u1'
    );
    expect(result.status).toBe('pending');
  });
});

describe('updateAppointmentStatus self-exclusion', () => {
  it('does not conflict with itself when confirming', async () => {
    const appt = { id: 'a1', patientId: 'p1', appointmentDate: BASE_DATE, status: 'pending' };
    (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(appt);
    // findFirst for conflict check should use excludeId — returns null (no other conflict)
    (prisma.appointment.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.appointment.update as jest.Mock).mockResolvedValue({ ...appt, status: 'confirmed' });

    const result = await appointmentsService.updateAppointmentStatus('a1', 'confirmed');
    expect(result.status).toBe('confirmed');
  });

  it('throws 404 for non-existent appointment', async () => {
    (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(appointmentsService.updateAppointmentStatus('bad-id', 'confirmed'))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});
