import { apiGet, apiPost } from './client';
import type { LoginResponse, User } from '@/types';

export const authApi = {
  login: (email: string, password: string) =>
    apiPost<LoginResponse>('/auth/login', { email, password }),

  me: () => apiGet<User>('/auth/me'),
};
