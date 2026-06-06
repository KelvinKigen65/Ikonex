import api from './axios';
import type { ClassStream } from '@/types';

export const getStreams = (params?: { page?: number; search?: string }) =>
  api.get<{ streams: ClassStream[]; total: number }>('/streams', { params });

export const getStream = (id: string) =>
  api.get<{ stream: ClassStream }>(`/streams/${id}`);

export const createStream = (data: Partial<ClassStream>) =>
  api.post<{ stream: ClassStream }>('/streams', data);

export const updateStream = (id: string, data: Partial<ClassStream>) =>
  api.put<{ stream: ClassStream }>(`/streams/${id}`, data);

export const deleteStream = (id: string) =>
  api.delete(`/streams/${id}`);
