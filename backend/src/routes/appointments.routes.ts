import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { createAppointmentSchema, updateStatusSchema } from '../schemas/appointment.schemas';
import * as appointmentsController from '../controllers/appointments.controller';

const router = Router();

router.post('/', validate(createAppointmentSchema), appointmentsController.create);
router.get('/', appointmentsController.list);
router.patch('/:id/status', validate(updateStatusSchema), appointmentsController.updateStatus);

export default router;
