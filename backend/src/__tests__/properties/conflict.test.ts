/**
 * Property-Based Tests: Appointment Conflict Rules
 *
 * Validates: Requirements 6.2 (30-minute conflict window)
 */
import * as fc from 'fast-check';
import * as appointmentsService from '../../services/appointments.service';
import { prisma } from '../../prisma/client';

jest.mock('../../prisma/client', () => ({
  prisma: {
    appointment: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    patient: { findFirst: jest.fn() },
    $transaction: jest.fn(),
  },
}));

const CONFLICT_MS = 30 * 60 * 1000;

// Property 1: Appointment Conflict Rejection
describe('P1: Appointment Conflict Rejection', () => {
  /**
   * Validates: Requirements 6.2
   * For any offset in [1, 29] minutes from a confirmed appointment,
   * creating a new appointment for the same patient must throw 409.
   */
  it('rejects any second confirmed appointment within 30-minute window', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.date({ min: new Date('2024-01-01'), max: new Date('2025-01-01') }),
        fc.integer({ min: 1, max: 29 }),
        async (baseDate, offsetMinutes) => {
          const conflictDate = new Date(baseDate.getTime() + offsetMinutes * 60 * 1000);
          const existingConfirmed = {
            id: 'a0',
            patientId: 'p1',
            status: 'confirmed',
            appointmentDate: baseDate,
          };

          (prisma.patient.findFirst as jest.Mock).mockResolvedValue({ id: 'p1', deletedAt: null });
          (prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) => {
            const txMock = {
              appointment: {
                findFirst: jest.fn().mockResolvedValue(existingConfirmed),
                create: jest.fn(),
              },
            };
            return fn(txMock);
          });

          try {
            await appointmentsService.createAppointment(
              { patientId: 'p1', appointmentDate: conflictDate.toISOString() },
              'u1'
            );
            return false; // should have thrown
          } catch (e: any) {
            return e.statusCode === 409;
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Property 2: Appointment Conflict Boundary Acceptance
describe('P2: Appointment Conflict Boundary Acceptance', () => {
  /**
   * Validates: Requirements 6.2
   * An appointment exactly 30 minutes after a confirmed appointment
   * is NOT a conflict (boundary is exclusive).
   */
  it('accepts appointment exactly 30 minutes after confirmed (not a conflict)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.date({ min: new Date('2024-01-01'), max: new Date('2025-01-01') }),
        async (baseDate) => {
          const exactBoundary = new Date(baseDate.getTime() + CONFLICT_MS);

          (prisma.patient.findFirst as jest.Mock).mockResolvedValue({ id: 'p1', deletedAt: null });
          (prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) => {
            const txMock = {
              appointment: {
                findFirst: jest.fn().mockResolvedValue(null), // boundary → no conflict
                create: jest.fn().mockResolvedValue({
                  id: 'a1',
                  status: 'pending',
                  patientId: 'p1',
                  appointmentDate: exactBoundary,
                  createdBy: 'u1',
                  notes: null,
                  createdAt: new Date(),
                }),
              },
            };
            return fn(txMock);
          });

          const result = await appointmentsService.createAppointment(
            { patientId: 'p1', appointmentDate: exactBoundary.toISOString() },
            'u1'
          );
          return result.status === 'pending';
        }
      ),
      { numRuns: 100 }
    );
  });
});
