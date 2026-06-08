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
  frequency: 'weekly' | 'biweekly' | 'monthly';
  description?: string;
  createdAt: string;
}

export type CheckInSessionStatus = 'locked' | 'open' | 'closed';

export interface CheckInSession {
  id: string;
  periodId: string;
  periodTitle: string;
  periodYear: number;
  periodQuarter: number;
  title: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  status: CheckInSessionStatus;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  createdAt: string;
}

export interface CheckInCompletion {
  departmentId: string;
  departmentName: string;
  totalKrs: number;
  submittedKrs: number;
  completionPercent: number;
}

export interface SessionKr {
  id: string;
  title: string;
  description?: string;
  currentValue: number;
  targetValue: number;
  startValue: number;
  unit?: string;
  progress: number;
  status: string;
  ownerId: string;
  ownerName: string;
  objectiveId: string;
  objectiveTitle: string;
  hasCheckedIn: boolean;
  lastCheckInValue?: number;
  lastCheckInNote?: string;
  isMyKr: boolean;
}

export type ObjectiveStatus = 'draft' | 'active' | 'completed' | 'cancelled' | 'archived';
export type ObjectiveScope = 'organization' | 'team';

export interface Objective {
  id: string;
  title: string;
  description?: string;
  status: ObjectiveStatus;
  scope: ObjectiveScope;
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

export type TaskStatus = 'assigned' | 'in_progress' | 'done' | 'archived';
export type TaskPriority = 'normal' | 'important' | 'urgent';

export interface TaskTag {
  id: string;
  label: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  position: number;
  minutesId?: string;
  sessionId?: string;
  sourceType?: string;
  sourceSessionTitle?: string;
  sourcePeriodTitle?: string;
  sourcePeriodYear?: number;
  sourcePeriodQuarter?: number;
  assigneeId: string;
  assigneeName: string;
  assigneeDepartment?: string;
  assigneeDepartmentId?: string;
  createdBy: string;
  creatorName: string;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  tags: TaskTag[];
}

export interface TaskComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionMinutesFull {
  id: string;
  sessionId: string;
  content: string;
  sessionTitle: string;
  sessionStartDate: string;
  sessionEndDate: string;
  periodTitle: string;
  periodYear: number;
  periodQuarter: number;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
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
