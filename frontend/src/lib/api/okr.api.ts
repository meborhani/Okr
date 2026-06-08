import { apiGet, apiPost, apiPatch, apiDelete, apiPut } from './client';
import type { OkrPeriod, Objective, KeyResult, CheckIn, DashboardData, CheckInSession, CheckInCompletion, SessionKr, Task, TaskComment, SessionMinutesFull } from '@/types';

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
    departmentId?: string; teamId?: string; weight?: number; scope?: string;
  }) => apiPost<Objective>('/objectives', data),
  update: (id: string, data: {
    title?: string; description?: string; ownerId?: string;
    departmentId?: string; teamId?: string; status?: string; weight?: number; scope?: string;
  }) => apiPatch<Objective>(`/objectives/${id}`, data),
  remove: (id: string) => apiDelete<null>(`/objectives/${id}`),
};

export const keyResultsApi = {
  getAll: (params?: { objectiveId?: string; ownerId?: string; periodId?: string }) =>
    apiGet<KeyResult[]>('/key-results', params as Record<string, unknown>),
  getById: (id: string) => apiGet<KeyResult>(`/key-results/${id}`),
  getCheckIns: (id: string) => apiGet<CheckIn[]>(`/key-results/${id}/check-ins`),
  create: (data: {
    title: string; description?: string; objectiveId: string; ownerId: string;
    startValue: number; targetValue: number; unit?: string; weight?: number;
  }) => apiPost<KeyResult>('/key-results', data),
  update: (id: string, data: {
    title?: string; description?: string; ownerId?: string;
    targetValue?: number; unit?: string; weight?: number; status?: string;
  }) => apiPatch<KeyResult>(`/key-results/${id}`, data),
  remove: (id: string) => apiDelete<null>(`/key-results/${id}`),
};

export const checkInsApi = {
  getAll: () => apiGet<CheckIn[]>('/check-ins'),
  create: (data: { keyResultId: string; value: number; note?: string; checkDate?: string; sessionId?: string }) =>
    apiPost<CheckIn>('/check-ins', data),
};

export const checkInSessionsApi = {
  getAll: (periodId?: string) =>
    apiGet<CheckInSession[]>('/check-in-sessions', periodId ? { periodId } : undefined),
  getCurrent: () => apiGet<CheckInSession | null>('/check-in-sessions/current'),
  getById: (id: string) => apiGet<CheckInSession>(`/check-in-sessions/${id}`),
  getCompletion: (id: string) => apiGet<CheckInCompletion[]>(`/check-in-sessions/${id}/completion`),
  generateForPeriod: (periodId: string, frequency: string) =>
    apiPost<null>('/check-in-sessions/generate', { periodId, frequency }),
  update: (id: string, data: { title?: string; startDate?: string; endDate?: string; dueDate?: string; status?: string }) =>
    apiPatch<CheckInSession>(`/check-in-sessions/${id}`, data),
  remove: (id: string) => apiDelete<null>(`/check-in-sessions/${id}`),
  getKrsForSession: (id: string) => apiGet<SessionKr[]>(`/check-in-sessions/${id}/key-results`),
};

export interface KrTimelineSession {
  sessionId: string;
  title: string;
  gregorianDate: string;
  value: number;
}
export interface KrTimeline {
  keyResultId: string;
  keyResultTitle: string;
  startValue: number;
  targetValue: number;
  unit?: string;
  sessions: KrTimelineSession[];
  thresholds: { p0: number; p30: number; p70: number; p100: number };
}

export const reportsApi = {
  getDashboard: (periodId?: string) =>
    apiGet<DashboardData>('/reports/dashboard', periodId ? { periodId } : undefined),
  getTeamProgress: (periodId?: string) =>
    apiGet<TeamProgress[]>('/reports/team-progress', periodId ? { periodId } : undefined),
  getUserProgress: (periodId?: string) =>
    apiGet<UserProgress[]>('/reports/user-progress', periodId ? { periodId } : undefined),
  getCheckInCompletion: (sessionId?: string) =>
    apiGet<CheckInCompletion[]>('/reports/check-in-completion', sessionId ? { sessionId } : undefined),
  getKeyResultTimeline: (keyResultId: string) =>
    apiGet<KrTimeline>('/reports/key-result-timeline', { keyResultId }),
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
  changePassword: (id: string, password: string) => apiPatch<null>(`/users/${id}/password`, { password }),
};

export interface Role { id: string; name: string; display_name: string; }
export const rolesApi = {
  getAll: () => apiGet<Role[]>('/roles'),
};

export interface DepartmentItem {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  managerName?: string;
  parentId?: string;
  parentName?: string;
  isActive: boolean;
}

export interface TeamItem {
  id: string;
  name: string;
  description?: string;
  departmentId?: string;
  departmentName?: string;
  managerId?: string;
  managerName?: string;
  isActive: boolean;
}

export const teamsApi = {
  getAll: () => apiGet<TeamItem[]>('/teams'),
  create: (data: { name: string; description?: string; departmentId?: string; managerId?: string }) =>
    apiPost<TeamItem>('/teams', data),
  update: (id: string, data: { name?: string; description?: string; departmentId?: string; managerId?: string }) =>
    apiPatch<TeamItem>(`/teams/${id}`, data),
  remove: (id: string) => apiDelete<{ id: string }>(`/teams/${id}`),
};

export const departmentsApi = {
  getAll: () => apiGet<DepartmentItem[]>('/departments'),
  create: (data: { name: string; description?: string; managerId?: string; parentId?: string }) =>
    apiPost<DepartmentItem>('/departments', data),
  update: (id: string, data: { name?: string; description?: string; managerId?: string }) =>
    apiPatch<DepartmentItem>(`/departments/${id}`, data),
  remove: (id: string) => apiDelete<{ id: string }>(`/departments/${id}`),
};

export const tasksApi = {
  getAll: () => apiGet<Task[]>('/tasks'),
  getById: (id: string) => apiGet<Task>(`/tasks/${id}`),
  create: (data: {
    title: string; description?: string; priority?: string;
    assigneeId: string; minutesId?: string; sessionId?: string; sourceType?: string; dueDate?: string;
  }) => apiPost<Task>('/tasks', data),
  update: (id: string, data: {
    title?: string; description?: string; priority?: string;
    status?: string; assigneeId?: string; dueDate?: string | null;
  }) => apiPatch<Task>(`/tasks/${id}`, data),
  updateStatus: (id: string, status: string) => apiPatch<Task>(`/tasks/${id}/status`, { status }),
  archive: (id: string) => apiPatch<Task>(`/tasks/${id}/archive`, {}),
  remove: (id: string) => apiDelete<null>(`/tasks/${id}`),
  getComments: (id: string) => apiGet<TaskComment[]>(`/tasks/${id}/comments`),
  addComment: (id: string, content: string) => apiPost<TaskComment[]>(`/tasks/${id}/comments`, { content }),
  deleteComment: (id: string, commentId: string) => apiDelete<null>(`/tasks/${id}/comments/${commentId}`),
  addTag: (id: string, label: string, color: string) => apiPost<Task>(`/tasks/${id}/tags`, { label, color }),
  removeTag: (id: string, tagId: string) => apiDelete<null>(`/tasks/${id}/tags/${tagId}`),
};

export interface SessionMinutes {
  id: string; sessionId: string; content: string;
  createdAt: string; updatedAt: string;
  createdByName?: string; updatedByName?: string;
}

export const sessionMinutesApi = {
  getAll: () => apiGet<SessionMinutesFull[]>('/session-minutes'),
  get: (sessionId: string) => apiGet<SessionMinutes | null>(`/session-minutes/${sessionId}`),
  save: (sessionId: string, content: string) => apiPut<SessionMinutes>(`/session-minutes/${sessionId}`, { content }),
};
