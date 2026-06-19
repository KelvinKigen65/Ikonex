import api from './axios';
import { normalizeCollection } from './normalize';
import type { GradingScale } from '@/types';

export const getGradingScales = () =>
  api
    .get<GradingScale[] | { gradingScales: GradingScale[]; total: number; pages: number }>('/grading-scales/')
    .then(res => normalizeCollection(res, 'gradingScales'));

export const updateGradingScales = (gradingScales: GradingScale[]) =>
  api.put<{ gradingScales: GradingScale[] }>('/grading-scales', { gradingScales });
