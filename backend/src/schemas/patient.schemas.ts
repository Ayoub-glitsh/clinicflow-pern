import { z } from 'zod';

export const createPatientSchema = z.object({
  fullName: z.string().trim().min(1, 'fullName is required'),
  cin: z.string().trim().min(1, 'cin is required'),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'birthDate must be YYYY-MM-DD'),
  phone: z.string().trim().min(1, 'phone is required'),
  address: z.string().trim().optional(),
});

export const updatePatientSchema = createPatientSchema.partial();

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
