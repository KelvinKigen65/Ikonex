import api from './axios';
import { normalizeCollection } from './normalize';
import type { Assessment, Score } from '@/types';

export const getAssessments = (params?: { subjectId?: string; streamId?: string; term?: string; academicYear?: string }) =>
  api
    .get<Assessment[] | { assessments: Assessment[]; total: number; pages: number }>('/assessments/', { params })
    .then(res => normalizeCollection(res, 'assessments'));

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
