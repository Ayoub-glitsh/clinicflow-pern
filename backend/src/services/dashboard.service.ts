import { prisma } from '../prisma/client';

export async function getStats() {
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

  const [totalPatients, appointmentsToday, pendingCount, confirmedCount] = await prisma.$transaction([
    prisma.patient.count({ where: { deletedAt: null } }),
    prisma.appointment.count({
      where: { appointmentDate: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.appointment.count({ where: { status: 'pending' } }),
    prisma.appointment.count({ where: { status: 'confirmed' } }),
  ]);

  return { totalPatients, appointmentsToday, pendingCount, confirmedCount };
}
