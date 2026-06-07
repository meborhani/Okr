import { apiGet, apiPost, apiPatch, apiDelete } from './client';
import type { OkrPeriod, Objective, KeyResult, CheckIn, DashboardData } from '@/types';

export interface TeamProgress {
  teamId: string; teamName: string;
  totalObjectives: number; avgObjectiveProgress: number;
  totalKeyResults: number; avgKeyResultProgress: number;
}
export interface UserProgress {
  userId: string; userName: string; email: string; role: string;
  totalObjectives: number; avgObjectiveProgress: number;
  totalKeyResults: number; avgKeyResultProgress: number;
}

export const periodsApi = {
  getAll: () => apiGet<OkrPeriod[]>('/okr-periods'),
  getActive: () => apiGet<OkrPeriod[]>('/okr-periods/active'),
  getById: (id: string) => apiGet<OkrPeriod>(`/okr-periods/${id}`),
};

export const objectivesApi = {
  getAll: (params?: { periodId?: string; ownerId?: string }) =>
    apiGet<Objective[]>('/objectives', params as Record<string, unknown>),
  getById: (id: string) => apiGet<Objective>(`/objectives/${id}`),
  create: (data: {
    title: string; description?: string; periodId: string; ownerId: string;
    departmentId?: string; teamId?: string; weight?: number;
  }) => apiPost<Objective>('/objectives', data),
};

export const keyResultsApi = {
  getAll: (params?: { objectiveId?: string; ownerId?: string }) =>
    apiGet<KeyResult[]>('/key-results', params as Record<string, unknown>),
  getById: (id: string) => apiGet<KeyResult>(`/key-results/${id}`),
  getCheckIns: (id: string) => apiGet<CheckIn[]>(`/key-results/${id}/check-ins`),
  create: (data: {
    title: string; description?: string; objectiveId: string; ownerId: string;
    startValue: number; targetValue: number; unit?: string; weight?: number;
  }) => apiPost<KeyResult>('/key-results', data),
};

export const checkInsApi = {
  getAll: () => apiGet<CheckIn[]>('/check-ins'),
  create: (data: { keyResultId: string; value: number; note?: string; checkDate?: string }) =>
    apiPost<CheckIn>('/check-ins', data),
};

export const reportsApi = {
  getDashboard: (periodId?: string) =>
    apiGet<DashboardData>('/reports/dashboard', periodId ? { periodId } : undefined),
  getTeamProgress: (periodId?: string) =>
    apiGet<TeamProgress[]>('/reports/team-progress', periodId ? { periodId } : undefined),
  getUserProgress: (periodId?: string) =>
    apiGet<UserProgress[]>('/reports/user-progress', periodId ? { periodId } : undefined),
};

export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roleId: string;
  roleName: string;
  roleDisplayName: string;
  departmentId?: string;
  departmentName?: string;
  teamId?: string;
  teamName?: string;
  createdAt: string;
}
export interface UserListResponse { data: UserListItem[]; total: number; page: number; limit: number; }

export const usersApi = {
  getAll: (page = 1, limit = 50) =>
    apiGet<UserListResponse>('/users', { page, limit }),
  getById: (id: string) => apiGet<UserListItem>(`/users/${id}`),
  create: (data: {
    email: string; password: string; firstName: string; lastName: string;
    roleId: string; departmentId?: string; teamId?: string;
  }) => apiPost<UserListItem>('/users', data),
  update: (id: string, data: {
    firstName?: string; lastName?: string; roleId?: string;
    departmentId?: string; teamId?: string; isActive?: boolean;
  }) => apiPatch<UserListItem>(`/users/${id}`, data),
  remove: (id: string) => apiDelete<{ id: string }>(`/users/${id}`),
};

export interface Role { id: string; name: string; display_name: string; }
export const rolesApi = {
  getAll: () => apiGet<Role[]>('/roles'),
};

export const teamsApi = {
  getAll: () => apiGet<{ id: string; name: string }[]>('/teams'),
};

export const departmentsApi = {
  getAll: () => apiGet<{ id: string; name: string }[]>('/departments'),
};
