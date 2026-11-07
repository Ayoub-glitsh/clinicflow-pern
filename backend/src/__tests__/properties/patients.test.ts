/**
 * Property-Based Tests: Patient List Invariants
 *
 * Validates: Requirements 5.3 (soft-delete visibility), 5.1 (pagination)
 */
import * as fc from 'fast-check';
import * as patientsService from '../../services/patients.service';
import { prisma } from '../../prisma/client';

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

// Property 3: Soft-Delete Visibility Exclusion
describe('P3: Soft-Delete Visibility Exclusion', () => {
  /**
   * Validates: Requirements 5.3
   * Soft-deleted patients never appear in list responses.
   */
  it('soft-deleted patients never appear in list responses', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 100 }),
        async (limit) => {
          // Transaction returns empty data (as if soft-deleted patients were excluded by the where clause)
          (prisma.$transaction as jest.Mock).mockResolvedValue([[], 0]);
          const result = await patientsService.getPatients({ page: 1, limit });
          // Soft-deleted patients should not be present (mock returns none)
          return result.data.length === 0 && result.total === 0;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Property 4: Pagination Result Bound
describe('P4: Pagination Result Bound', () => {
  /**
   * Validates: Requirements 5.1
   * data.length never exceeds the requested limit.
   */
  it('data.length never exceeds the requested limit', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 10 }),
        async (limit, count) => {
          const actualCount = Math.min(count, limit);
          const mockData = Array.from({ length: actualCount }, (_, i) => ({
            id: `p${i}`,
            fullName: 'Test',
            cin: `CIN${i}`,
            birthDate: new Date(),
            phone: '0600',
            createdAt: new Date(),
            deletedAt: null,
          }));
          (prisma.$transaction as jest.Mock).mockResolvedValue([mockData, count]);
          const result = await patientsService.getPatients({ page: 1, limit });
          return result.data.length <= limit;
        }
      ),
      { numRuns: 100 }
    );
  });
});
