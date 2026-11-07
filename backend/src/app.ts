import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.routes';
import patientRouter from './routes/patients.routes';
import appointmentRouter from './routes/appointments.routes';
import dashboardRouter from './routes/dashboard.routes';
import { authMiddleware } from './middleware/auth.middleware';
import { errorMiddleware } from './middleware/error.middleware';

dotenv.config();

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());

// Public routes (before auth middleware)
app.use('/api/auth', authRouter);

// Auth middleware for all routes below
app.use(authMiddleware);

// Protected routes
app.use('/api/patients', patientRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/dashboard', dashboardRouter);

// Centralized error handler (must be last, 4 params)
app.use(errorMiddleware);

export default app;
