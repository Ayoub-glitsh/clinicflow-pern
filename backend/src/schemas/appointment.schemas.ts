import { z } from 'zod';

const appointmentStatusEnum = z.enum(['pending', 'confirmed', 'cancelled']);

export const createAppointmentSchema = z.object({
  patientId: z.string().uuid('patientId must be a valid UUID'),
  appointmentDate: z.string().datetime('appointmentDate must be a valid ISO 8601 datetime'),
  notes: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: appointmentStatusEnum,
});

export const updateAppointmentSchema = z.object({
  patientId: z.string().uuid('patientId must be a valid UUID').optional(),
  appointmentDate: z.string().datetime('appointmentDate must be a valid ISO 8601 datetime').optional(),
  notes: z.string().optional(),
  status: appointmentStatusEnum.optional(),
});

export const appointmentQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD')
    .optional(),
  status: appointmentStatusEnum.optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type AppointmentQueryInput = z.infer<typeof appointmentQuerySchema>;
