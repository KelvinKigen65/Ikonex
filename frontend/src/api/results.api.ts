import api from './axios';
import type { StudentResult, DashboardStats } from '@/types';

export const getResults = (params: { streamId: string; term: string; academicYear: string }) =>
  api.get<{ results: StudentResult[] }>('/results', { params });

export const getDashboardStats = () =>
  api.get<DashboardStats>('/results/dashboard');
