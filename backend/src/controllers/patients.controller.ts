import { Request, Response, NextFunction } from 'express';
import * as patientsService from '../services/patients.service';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const patient = await patientsService.createPatient(req.body);
    res.status(201).json(patient);
  } catch (err) { next(err); }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '10', 10);
    const search = req.query.search as string | undefined;
    const result = await patientsService.getPatients({ page, limit, search });
    res.status(200).json(result);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const patient = await patientsService.getPatientById(req.params.id);
    res.status(200).json(patient);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const patient = await patientsService.updatePatient(req.params.id, req.body);
    res.status(200).json(patient);
  } catch (err) { next(err); }
}

export async function softDelete(req: Request, res: Response, next: NextFunction) {
  try {
    await patientsService.softDeletePatient(req.params.id);
    res.status(200).json({ message: 'Patient soft-deleted' });
  } catch (err) { next(err); }
}
