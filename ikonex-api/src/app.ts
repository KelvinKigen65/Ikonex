import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes';
import streamRoutes from './routes/streams.routes';
import studentRoutes from './routes/students.routes';
import subjectRoutes from './routes/subjects.routes';
import assessmentRoutes from './routes/assessments.routes';
import resultRoutes from './routes/results.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
}));

// Middleware
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/streams', streamRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/results', resultRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;