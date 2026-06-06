import api from './axios';
import type { Subject } from '@/types';

export const getSubjects = (params?: { search?: string; status?: string }) =>
  api.get<{ subjects: Subject[] }>('/subjects', { params });

export const createSubject = (data: Partial<Subject>) =>
  api.post<{ subject: Subject }>('/subjects', data);

export const updateSubject = (id: string, data: Partial<Subject>) =>
  api.put<{ subject: Subject }>(`/subjects/${id}`, data);

export const deleteSubject = (id: string) =>
  api.delete(`/subjects/${id}`);

export const assignSubjectToStream = (streamId: string, subjectId: string) =>
  api.post('/subjects/assign', { streamId, subjectId });
