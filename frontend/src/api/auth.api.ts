import api from './axios';
import type { Role, User } from '@/types';

export const login = (email: string, password: string) =>
  api.post<{ token: string; user: User }>('/auth/login', { email, password });

export const register = (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Exclude<Role, 'SUPER_ADMIN' | 'STUDENT'>;
}) => api.post<{ token: string; user: User }>('/auth/register', data);

export const getProfile = () =>
  api.get<{ user: User }>('/auth/me');

export const changePassword = (data: { currentPassword: string; newPassword: string }) =>
  api.post('/auth/change-password', data);
