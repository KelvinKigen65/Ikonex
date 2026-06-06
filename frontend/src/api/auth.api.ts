import api from './axios';
import type { User } from '@/types';

export const login = (email: string, password: string) =>
  api.post<{ token: string; user: User }>('/auth/login', { email, password });

export const getProfile = () =>
  api.get<{ user: User }>('/auth/profile');

export const changePassword = (data: { currentPassword: string; newPassword: string }) =>
  api.patch('/auth/change-password', data);
