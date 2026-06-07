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
import gradingScaleRoutes from './routes/gradingScales.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const configuredOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const isAllowedDevOrigin = (origin: string) =>
  /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

// Security
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || configuredOrigins.includes(origin) || isAllowedDevOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin ${origin}`));
  },
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
app.get('/', (_, res) => res.json({
  name: 'Ikonex API',
  status: 'ok',
  health: '/health',
  apiBase: '/api',
}));
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));
app.get('/api', (_, res) => res.json({
  name: 'Ikonex API',
  routes: [
    '/api/auth',
    '/api/streams',
    '/api/students',
    '/api/subjects',
    '/api/assessments',
    '/api/results',
    '/api/grading-scales',
  ],
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/streams', streamRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/grading-scales', gradingScaleRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
