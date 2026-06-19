import api from './axios';
import { normalizeCollection } from './normalize';
import type { Student, StudentDetailRecord } from '@/types';

interface StudentsParams { page?: number; limit?: number; search?: string; streamId?: string; gender?: string; }

export const getStudents = (params?: StudentsParams) =>
  api
    .get<Student[] | { students: Student[]; total: number; pages: number }>('/students/', { params })
    .then(res => normalizeCollection(res, 'students'));

export const getStudent = (id: string) =>
  api.get<{ student: StudentDetailRecord }>(`/students/${id}`);

export const createStudent = (data: Partial<Student>) =>
  api.post<{ student: Student }>('/students', data);

export const updateStudent = (id: string, data: Partial<Student>) =>
  api.put<{ student: Student }>(`/students/${id}`, data);

export const deleteStudent = (id: string) =>
  api.delete(`/students/${id}`);
