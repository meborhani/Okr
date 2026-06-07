import { useQuery } from '@tanstack/react-query';
import { reportsApi, periodsApi } from '@/lib/api/okr.api';

export function useDashboard(periodId?: string) {
  const dashboard = useQuery({
    queryKey: ['dashboard', periodId],
    queryFn: () => reportsApi.getDashboard(periodId),
  });

  const activePeriods = useQuery({
    queryKey: ['periods', 'active'],
    queryFn: periodsApi.getActive,
  });

  return { dashboard, activePeriods };
}
