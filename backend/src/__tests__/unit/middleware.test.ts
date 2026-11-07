import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { errorMiddleware } from '../../middleware/error.middleware';
import { AppError } from '../../utils/AppError';
import { z } from 'zod';
import * as jwt from '../../utils/jwt';

const mockReq = (overrides?: Partial<Request>) => ({ headers: {}, ...overrides } as Request);
const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = () => jest.fn() as NextFunction;

jest.mock('../../utils/jwt');

describe('authMiddleware', () => {
  it('returns 401 when no Authorization header', () => {
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for malformed token', () => {
    (jwt.verifyToken as jest.Mock).mockImplementation(() => { throw new Error('invalid'); });
    const req = mockReq({ headers: { authorization: 'Bearer bad-token' } });
    const res = mockRes();
    const next = mockNext();
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
  });

  it('attaches user and calls next for valid token', () => {
    const payload = { id: 'u1', email: 'a@b.com', role: 'admin' as const };
    (jwt.verifyToken as jest.Mock).mockReturnValue(payload);
    const req = mockReq({ headers: { authorization: 'Bearer valid' } }) as any;
    const res = mockRes();
    const next = mockNext();
    authMiddleware(req, res, next);
    expect(req.user).toEqual(payload);
    expect(next).toHaveBeenCalled();
  });
});

describe('requireRole', () => {
  it('returns 403 if user role not in allowed list', () => {
    const req = mockReq() as any;
    req.user = { id: 'u1', email: 'a@b.com', role: 'staff' };
    const res = mockRes();
    const next = mockNext();
    requireRole('admin')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next if role is in allowed list', () => {
    const req = mockReq() as any;
    req.user = { id: 'u1', email: 'a@b.com', role: 'admin' };
    const res = mockRes();
    const next = mockNext();
    requireRole('admin')(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('validate middleware', () => {
  const schema = z.object({ email: z.string().email() });

  it('returns 400 with details on invalid body', () => {
    const req = mockReq({ body: { email: 'not-an-email' } } as any);
    const res = mockRes();
    const next = mockNext();
    validate(schema)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = (res.json as jest.Mock).mock.calls[0][0];
    expect(body.error).toBe('Validation failed');
    expect(body.details).toBeDefined();
    expect(next).not.toHaveBeenCalled();
  });

  it('replaces req.body with parsed data and calls next on valid input', () => {
    const req = mockReq({ body: { email: 'user@example.com' } } as any);
    const res = mockRes();
    const next = mockNext();
    validate(schema)(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ email: 'user@example.com' });
  });
});

describe('errorMiddleware', () => {
  it('returns AppError statusCode and message', () => {
    const err = new AppError(409, 'Conflict');
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();
    errorMiddleware(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'Conflict' });
  });

  it('returns 500 for unknown errors without stack traces', () => {
    const err = new Error('boom');
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();
    errorMiddleware(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    const body = (res.json as jest.Mock).mock.calls[0][0];
    expect(body.error).toBe('Internal server error');
    expect(body.stack).toBeUndefined();
  });
});
