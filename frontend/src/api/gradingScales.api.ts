import api from './axios';
import type { GradingScale } from '@/types';

export const getGradingScales = () =>
  api.get<{ gradingScales: GradingScale[] }>('/grading-scales');

export const updateGradingScales = (gradingScales: GradingScale[]) =>
  api.put<{ gradingScales: GradingScale[] }>('/grading-scales', { gradingScales });
