/**
 * Property-Based Tests: Authentication & Authorization
 *
 * Validates: Requirements 2.1 (JWT rejection), 2.3 (role guard)
 */
import * as fc from 'fast-check';
import request from 'supertest';
import app from '../../app';
import * as jwtUtils from '../../utils/jwt';

jest.mock('../../utils/jwt');

// Property 5: Invalid JWT Rejection
describe('P5: Invalid JWT Rejection', () => {
  /**
   * Validates: Requirements 2.1
   * Any random string token must return 401 on protected routes.
   */
  it('any random string token returns 401 on protected routes', async () => {
    (jwtUtils.verifyToken as jest.Mock).mockImplementation(() => {
      throw new Error('invalid token');
    });

    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 200 }),
        async (randomToken) => {
          const res = await request(app)
            .get('/api/dashboard/stats')
            .set('Authorization', `Bearer ${randomToken}`);
          return res.status === 401;
        }
      ),
      { numRuns: 50 } // fewer runs for HTTP tests
    );
  });
});

// Property 6: Role Guard Enforcement
describe('P6: Role Guard Enforcement', () => {
  /**
   * Validates: Requirements 2.3
   * Staff users always get 403 on admin-only DELETE /api/patients/:id.
   */
  it('staff users always get 403 on DELETE /api/patients/:id', async () => {
    (jwtUtils.verifyToken as jest.Mock).mockReturnValue({
      id: 'u2',
      email: 'staff@test.com',
      role: 'staff',
    });

    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async (patientId) => {
          const res = await request(app)
            .delete(`/api/patients/${patientId}`)
            .set('Authorization', 'Bearer staff-jwt');
          return res.status === 403;
        }
      ),
      { numRuns: 50 }
    );
  });
});
