import { prisma } from '../prisma/client';
import { AppError } from '../utils/AppError';
import { CreatePatientInput, UpdatePatientInput } from '../schemas/patient.schemas';

export async function createPatient(data: CreatePatientInput) {
  const existing = await prisma.patient.findFirst({ where: { cin: data.cin } });
  if (existing) throw new AppError(409, 'CIN is already registered');

  const patient = await prisma.patient.create({
    data: {
      fullName: data.fullName,
      cin: data.cin,
      birthDate: new Date(data.birthDate),
      phone: data.phone,
      address: data.address,
    },
  });

  return patient;
}

export async function getPatients({
  page = 1,
  limit = 10,
  search,
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const where = {
    deletedAt: null,
    ...(search
      ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as const } },
            { cin: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [data, total] = await prisma.$transaction([
    prisma.patient.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.patient.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getPatientById(id: string) {
  const patient = await prisma.patient.findFirst({ where: { id, deletedAt: null } });
  if (!patient) throw new AppError(404, 'Patient with id ' + id + ' not found');
  return patient;
}

export async function updatePatient(id: string, data: UpdatePatientInput) {
  // Ensure patient exists and is not soft-deleted
  await getPatientById(id);

  if (data.cin) {
    const cinConflict = await prisma.patient.findFirst({
      where: { cin: data.cin, NOT: { id } },
    });
    if (cinConflict) throw new AppError(409, 'CIN is already registered');
  }

  const updated = await prisma.patient.update({
    where: { id },
    data: {
      ...data,
      ...(data.birthDate ? { birthDate: new Date(data.birthDate) } : {}),
    },
  });

  return updated;
}

export async function softDeletePatient(id: string) {
  // Ensure patient exists and is not soft-deleted
  await getPatientById(id);

  const deleted = await prisma.patient.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return deleted;
}
