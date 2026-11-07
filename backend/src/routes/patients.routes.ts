import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { requireRole } from '../middleware/role.middleware';
import { createPatientSchema, updatePatientSchema } from '../schemas/patient.schemas';
import * as patientsController from '../controllers/patients.controller';

const router = Router();

router.post('/', validate(createPatientSchema), patientsController.create);
router.get('/', patientsController.list);
router.get('/:id', patientsController.getById);
router.put('/:id', validate(updatePatientSchema), patientsController.update);
router.delete('/:id', requireRole('admin'), patientsController.softDelete);

export default router;
