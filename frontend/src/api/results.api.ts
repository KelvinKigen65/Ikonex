import api from './axios';
import type {
  ClassPerformanceReport,
  DashboardStats,
  StudentReportCard,
  StudentResult,
} from '@/types';

export const getResults = (params: { streamId: string; term: string; academicYear: string }) =>
  api.get<{ results: StudentResult[] }>('/results', { params });

export const getDashboardStats = () =>
  api.get<DashboardStats>('/results/dashboard');

export const getStudentReportCard = (params: { studentId: string; term: string; academicYear: string }) =>
  api.get<{ reportCard: StudentReportCard }>('/results/report-card', { params });

export const getClassReport = (params: { streamId: string; term: string; academicYear: string }) =>
  api.get<{ classReport: ClassPerformanceReport }>('/results/class-report', { params });
