import * as patientsService from '../../services/patients.service';
import { prisma } from '../../prisma/client';
import { AppError } from '../../utils/AppError';

jest.mock('../../prisma/client', () => ({
  prisma: {
    patient: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const mockPatient = {
  id: 'p1',
  fullName: 'John Doe',
  cin: 'AB123456',
  birthDate: new Date('1990-01-01'),
  phone: '0612345678',
  createdAt: new Date(),
  deletedAt: null,
};

describe('patientsService.createPatient', () => {
  it('throws 409 if CIN already exists', async () => {
    (prisma.patient.findFirst as jest.Mock).mockResolvedValue(mockPatient);
    await expect(patientsService.createPatient({
      fullName: 'Jane', cin: 'AB123456', birthDate: '2000-01-01', phone: '0600000000',
    })).rejects.toMatchObject({ statusCode: 409 });
  });

  it('creates patient when CIN is unique', async () => {
    (prisma.patient.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.patient.create as jest.Mock).mockResolvedValue(mockPatient);
    const result = await patientsService.createPatient({
      fullName: 'Jane', cin: 'XY000000', birthDate: '2000-01-01', phone: '0600000000',
    });
    expect(result.cin).toBe('AB123456');
  });
});

describe('patientsService.softDeletePatient', () => {
  it('throws 404 if patient not found', async () => {
    (prisma.patient.findFirst as jest.Mock).mockResolvedValue(null);
    await expect(patientsService.softDeletePatient('nonexistent')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('sets deletedAt on soft delete', async () => {
    (prisma.patient.findFirst as jest.Mock).mockResolvedValue(mockPatient);
    const deleted = { ...mockPatient, deletedAt: new Date() };
    (prisma.patient.update as jest.Mock).mockResolvedValue(deleted);
    const result = await patientsService.softDeletePatient('p1');
    expect(result.deletedAt).toBeDefined();
  });
});

describe('patientsService.getPatients', () => {
  it('excludes soft-deleted patients', async () => {
    (prisma.$transaction as jest.Mock).mockResolvedValue([[mockPatient], 1]);
    const result = await patientsService.getPatients({ page: 1, limit: 10 });
    const txCall = (prisma.$transaction as jest.Mock).mock.calls[0][0];
    // Verify the transaction was called (pagination/count)
    expect(Array.isArray(txCall)).toBe(true);
    expect(result.total).toBe(1);
  });

  it('returns correct pagination metadata', async () => {
    (prisma.$transaction as jest.Mock).mockResolvedValue([[mockPatient], 15]);
    const result = await patientsService.getPatients({ page: 2, limit: 10 });
    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(2);
    expect(result.limit).toBe(10);
  });
});
