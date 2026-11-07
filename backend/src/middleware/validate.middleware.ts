import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error!.errors.map(e => ({
          field: e.path.join('.') || e.path[0],
          message: e.message,
        })),
      });
      return;
    }

    req.body = result.data;
    next();
  };
}
