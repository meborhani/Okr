import { useQuery } from '@tanstack/react-query';
import { objectivesApi, keyResultsApi } from '@/lib/api/okr.api';
import { useAuthStore } from '@/lib/auth/auth.store';

export function useMyObjectives(periodId?: string) {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['objectives', 'mine', periodId],
    queryFn: () => objectivesApi.getAll({ periodId, ownerId: user?.id }),
    enabled: !!user?.id,
  });
}

export function useObjective(id: string) {
  return useQuery({
    queryKey: ['objectives', id],
    queryFn: () => objectivesApi.getById(id),
    enabled: !!id,
  });
}

export function useObjectiveKeyResults(objectiveId: string) {
  return useQuery({
    queryKey: ['key-results', 'by-objective', objectiveId],
    queryFn: () => keyResultsApi.getAll({ objectiveId }),
    enabled: !!objectiveId,
  });
}
