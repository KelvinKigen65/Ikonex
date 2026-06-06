import api from './axios';
import type { Assessment, Score } from '@/types';

export const getAssessments = (params?: { subjectId?: string; streamId?: string; term?: string; academicYear?: string }) =>
  api.get<{ assessments: Assessment[] }>('/assessments', { params });

export const createAssessment = (data: Partial<Assessment>) =>
  api.post<{ assessment: Assessment }>('/assessments', data);

export const updateAssessment = (id: string, data: Partial<Assessment>) =>
  api.put<{ assessment: Assessment }>(`/assessments/${id}`, data);

export const deleteAssessment = (id: string) =>
  api.delete(`/assessments/${id}`);

export const getScores = (assessmentId: string) =>
  api.get<{ scores: Score[] }>(`/assessments/${assessmentId}/scores`);

export const bulkSubmitScores = (assessmentId: string, scores: { studentId: string; marks: number; remarks?: string }[]) =>
  api.post('/assessments/scores/bulk', { assessmentId, scores });
