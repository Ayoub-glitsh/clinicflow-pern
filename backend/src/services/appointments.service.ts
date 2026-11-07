import { AppError } from '../utils/AppError';
import { prisma } from '../prisma/client';
import { Prisma } from '@prisma/client';
import { CreateAppointmentInput, AppointmentQueryInput } from '../schemas/appointment.schemas';

const CONFLICT_WINDOW_MS = 30 * 60 * 1000; // 30 minutes in milliseconds

async function findConflict(patientId: string, appointmentDate: Date, excludeId?: string) {
  const windowStart = new Date(appointmentDate.getTime() - CONFLICT_WINDOW_MS);
  const windowEnd = new Date(appointmentDate.getTime() + CONFLICT_WINDOW_MS);

  return prisma.appointment.findFirst({
    where: {
      patientId,
      status: 'confirmed',
      appointmentDate: {
        gt: windowStart, // strictly greater than (boundary NOT a conflict)
        lt: windowEnd,   // strictly less than
      },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

export async function createAppointment(data: CreateAppointmentInput, userId: string) {
  const appointmentDate = new Date(data.appointmentDate);

  // Verify patient exists
  const patient = await prisma.patient.findFirst({ where: { id: data.patientId, deletedAt: null } });
  if (!patient) throw new AppError(404, 'Patient with id ' + data.patientId + ' not found');

  return prisma.$transaction(async (tx) => {
    // Re-check conflict inside transaction for concurrency safety
    const windowStart = new Date(appointmentDate.getTime() - CONFLICT_WINDOW_MS);
    const windowEnd = new Date(appointmentDate.getTime() + CONFLICT_WINDOW_MS);

    const conflict = await tx.appointment.findFirst({
      where: {
        patientId: data.patientId,
        status: 'confirmed',
        appointmentDate: { gt: windowStart, lt: windowEnd },
      },
    });

    if (conflict) {
      throw new AppError(409, 'Conflicts with confirmed appointment at ' + conflict.appointmentDate.toISOString());
    }

    return tx.appointment.create({
      data: {
        patientId: data.patientId,
        appointmentDate,
        notes: data.notes,
        createdBy: userId,
        status: 'pending',
      },
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function getAppointments(query: AppointmentQueryInput) {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '10', 10);
  const skip = (page - 1) * limit;

  const where: Prisma.AppointmentWhereInput = {};

  if (query.date) {
    const dayStart = new Date(query.date + 'T00:00:00.000Z');
    const dayEnd = new Date(query.date + 'T23:59:59.999Z');
    where.appointmentDate = { gte: dayStart, lte: dayEnd };
  }

  if (query.status) {
    where.status = query.status;
  }

  const [data, total] = await prisma.$transaction([
    prisma.appointment.findMany({ where, skip, take: limit, orderBy: { appointmentDate: 'asc' } }),
    prisma.appointment.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function updateAppointmentStatus(id: string, newStatus: 'pending' | 'confirmed' | 'cancelled') {
  const appt = await prisma.appointment.findUnique({ where: { id } });
  if (!appt) throw new AppError(404, 'Appointment with id ' + id + ' not found');

  if (newStatus === 'confirmed') {
    const conflict = await findConflict(appt.patientId, appt.appointmentDate, id);
    if (conflict) {
      throw new AppError(409, 'Conflicts with confirmed appointment at ' + conflict.appointmentDate.toISOString());
    }
  }

  return prisma.appointment.update({ where: { id }, data: { status: newStatus } });
}
