import axios from 'axios';
import type { ApiResponse } from '@/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await apiClient.get<ApiResponse<T>>(url, { params });
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data as T;
}

export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  const res = await apiClient.post<ApiResponse<T>>(url, data);
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data as T;
}

export async function apiPatch<T>(url: string, data?: unknown): Promise<T> {
  const res = await apiClient.patch<ApiResponse<T>>(url, data);
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data as T;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const res = await apiClient.delete<ApiResponse<T>>(url);
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data as T;
}
