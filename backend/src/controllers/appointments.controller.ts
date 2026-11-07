import { Request, Response, NextFunction } from 'express';
import * as appointmentsService from '../services/appointments.service';
import { appointmentQuerySchema, updateAppointmentSchema } from '../schemas/appointment.schemas';
import { AppError } from '../utils/AppError';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const appointment = await appointmentsService.createAppointment(req.body, req.user!.id);
    res.status(201).json(appointment);
  } catch (err) { next(err); }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = appointmentQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(400, 'Validation failed', parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
    }
    const result = await appointmentsService.getAppointments(parsed.data);
    res.status(200).json(result);
  } catch (err) { next(err); }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const appointment = await appointmentsService.updateAppointmentStatus(req.params.id, req.body.status);
    res.status(200).json(appointment);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateAppointmentSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, 'Validation failed', parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
    }
    const appointment = await appointmentsService.updateAppointment(req.params.id, parsed.data);
    res.status(200).json(appointment);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await appointmentsService.deleteAppointment(req.params.id);
    res.status(200).json({ message: 'Appointment deleted' });
  } catch (err) { next(err); }
}
