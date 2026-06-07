export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  errors: { field?: string; message: string }[] | null;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleName: string;
  roleDisplayName?: string;
  departmentName?: string;
  teamName?: string;
  permissions: string[];
  lastLoginAt?: string;
  createdAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface OkrPeriod {
  id: string;
  title: string;
  year: number;
  quarter: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'closed' | 'archived';
  description?: string;
  createdAt: string;
}

export type ObjectiveStatus = 'draft' | 'active' | 'completed' | 'cancelled' | 'archived';

export interface Objective {
  id: string;
  title: string;
  description?: string;
  status: ObjectiveStatus;
  progress: number;
  weight: number;
  periodId: string;
  periodTitle: string;
  ownerId: string;
  ownerName: string;
  departmentId?: string;
  departmentName?: string;
  teamId?: string;
  teamName?: string;
  parentId?: string;
  parentTitle?: string;
  createdAt: string;
  updatedAt: string;
}

export type KeyResultStatus = 'not_started' | 'on_track' | 'at_risk' | 'off_track' | 'completed' | 'cancelled';

export interface KeyResult {
  id: string;
  title: string;
  description?: string;
  status: KeyResultStatus;
  progress: number;
  startValue: number;
  targetValue: number;
  currentValue: number;
  unit?: string;
  weight: number;
  objectiveId: string;
  objectiveTitle: string;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckIn {
  id: string;
  value: number;
  note?: string;
  checkDate: string;
  keyResultId: string;
  keyResultTitle?: string;
  checkedBy: string;
  checkedByName: string;
  createdAt: string;
}

export interface DashboardData {
  activePeriods: OkrPeriod[];
  objectives: {
    total_objectives: number;
    completed_objectives: number;
    active_objectives: number;
    at_risk_objectives: number;
    avg_progress: number;
  };
  keyResults: {
    total_key_results: number;
    completed_key_results: number;
    on_track_key_results: number;
    at_risk_key_results: number;
    off_track_key_results: number;
    avg_progress: number;
  };
}
