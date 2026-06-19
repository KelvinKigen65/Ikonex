import api from './axios';
import { normalizeCollection } from './normalize';
import type { Subject } from '@/types';

export const getSubjects = (params?: { search?: string; status?: string }) =>
  api
    .get<Subject[] | { subjects: Subject[]; total: number; pages: number }>('/subjects/', { params })
    .then(res => normalizeCollection(res, 'subjects'));

export const createSubject = (data: Partial<Subject>) =>
  api.post<{ subject: Subject }>('/subjects', data);

export const updateSubject = (id: string, data: Partial<Subject>) =>
  api.put<{ subject: Subject }>(`/subjects/${id}`, data);

export const deleteSubject = (id: string) =>
  api.delete(`/subjects/${id}`);

export const assignSubjectToStream = (streamId: string, subjectId: string) =>
  api.post('/subjects/assign', { streamId, subjectId });
