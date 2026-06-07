import { useQuery } from '@tanstack/react-query';
import { keyResultsApi } from '@/lib/api/okr.api';

export function useKeyResult(id: string) {
  return useQuery({
    queryKey: ['key-results', id],
    queryFn: () => keyResultsApi.getById(id),
    enabled: !!id,
  });
}

export function useKeyResultCheckIns(id: string) {
  return useQuery({
    queryKey: ['check-ins', 'by-kr', id],
    queryFn: () => keyResultsApi.getCheckIns(id),
    enabled: !!id,
  });
}
