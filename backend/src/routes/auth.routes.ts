import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { loginSchema } from '../schemas/auth.schemas';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authMiddleware, authController.getMe);

export default router;
