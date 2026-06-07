import type { ObjectiveStatus, KeyResultStatus } from '@/types';

export const objectiveStatusLabel: Record<ObjectiveStatus, string> = {
  draft: 'پیش‌نویس',
  active: 'فعال',
  completed: 'تکمیل شده',
  cancelled: 'لغو شده',
  archived: 'آرشیو',
};

export const objectiveStatusColor: Record<ObjectiveStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-primary-100 text-primary-700',
  completed: 'bg-success-50 text-success-600',
  cancelled: 'bg-danger-50 text-danger-500',
  archived: 'bg-gray-100 text-gray-500',
};

export const krStatusLabel: Record<KeyResultStatus, string> = {
  not_started: 'شروع نشده',
  on_track: 'در مسیر',
  at_risk: 'در خطر',
  off_track: 'خارج از مسیر',
  completed: 'تکمیل',
  cancelled: 'لغو',
};

export const krStatusColor: Record<KeyResultStatus, string> = {
  not_started: 'bg-gray-100 text-gray-600',
  on_track: 'bg-success-50 text-success-600',
  at_risk: 'bg-warning-50 text-warning-600',
  off_track: 'bg-danger-50 text-danger-500',
  completed: 'bg-primary-100 text-primary-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

export const krProgressColor: Record<KeyResultStatus, string> = {
  not_started: 'bg-gray-300',
  on_track: 'bg-success-500',
  at_risk: 'bg-warning-500',
  off_track: 'bg-danger-500',
  completed: 'bg-primary-500',
  cancelled: 'bg-gray-300',
};
