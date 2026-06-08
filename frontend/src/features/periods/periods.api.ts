import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/client';
import type { OkrPeriod } from '@/types';

export const periodsApiExt = {
  getAll: () => apiGet<OkrPeriod[]>('/okr-periods'),
  getActive: () => apiGet<OkrPeriod[]>('/okr-periods/active'),
  create: (data: { title: string; year: number; quarter: number; startDate: string; endDate: string; description?: string; frequency?: string }) =>
    apiPost<OkrPeriod>('/okr-periods', data),
  update: (id: string, data: { title?: string; startDate?: string; endDate?: string; description?: string }) =>
    apiPatch<OkrPeriod>(`/okr-periods/${id}`, data),
  activate: (id: string) => apiPost<OkrPeriod>(`/okr-periods/${id}/activate`),
  close: (id: string) => apiPost<OkrPeriod>(`/okr-periods/${id}/close`),
  archive: (id: string) => apiPost<OkrPeriod>(`/okr-periods/${id}/archive`),
  reopen: (id: string) => apiPost<OkrPeriod>(`/okr-periods/${id}/reopen`),
  remove: (id: string) => apiDelete<null>(`/okr-periods/${id}`),
};
