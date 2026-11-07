import * as bcrypt from 'bcryptjs';
import * as authService from '../../services/auth.service';
import { prisma } from '../../prisma/client';
import { AppError } from '../../utils/AppError';
import * as jwtUtils from '../../utils/jwt';

jest.mock('../../prisma/client', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('../../utils/jwt', () => ({
  signToken: jest.fn().mockReturnValue('mock-token'),
}));

describe('authService.login', () => {
  const mockUser = {
    id: 'u1',
    email: 'admin@clinicflow.com',
    passwordHash: bcrypt.hashSync('Admin123!', 10),
    role: 'admin' as const,
  };

  it('returns token and user on valid credentials', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    const result = await authService.login('admin@clinicflow.com', 'Admin123!');
    expect(result.token).toBe('mock-token');
    expect(result.user.email).toBe('admin@clinicflow.com');
    expect((result.user as any).passwordHash).toBeUndefined();
  });

  it('throws 401 when user not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(authService.login('x@x.com', 'pass')).rejects.toMatchObject({
      statusCode: 401,
      message: 'Invalid email or password',
    });
  });

  it('throws 401 on wrong password without revealing which field', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    await expect(authService.login('admin@clinicflow.com', 'WrongPass')).rejects.toMatchObject({
      statusCode: 401,
      message: 'Invalid email or password',
    });
  });

  it('getMe returns user without passwordHash', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    const user = await authService.getMe('u1');
    expect(user.id).toBe('u1');
    expect((user as any).passwordHash).toBeUndefined();
  });
});
