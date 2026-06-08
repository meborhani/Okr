import { useQuery } from '@tanstack/react-query';
import { reportsApi, periodsApi, checkInSessionsApi } from '@/lib/api/okr.api';

export function useDashboard(periodId?: string) {
  const dashboard = useQuery({
    queryKey: ['dashboard', periodId],
    queryFn: () => reportsApi.getDashboard(periodId),
  });

  const activePeriods = useQuery({
    queryKey: ['periods', 'active'],
    queryFn: periodsApi.getActive,
  });

  const currentSession = useQuery({
    queryKey: ['check-in-sessions', 'current'],
    queryFn: () => checkInSessionsApi.getCurrent(),
  });

  const checkInCompletion = useQuery({
    queryKey: ['check-in-completion', currentSession.data?.id],
    queryFn: () => reportsApi.getCheckInCompletion(currentSession.data?.id),
    enabled: !!currentSession.data?.id,
  });

  return { dashboard, activePeriods, currentSession, checkInCompletion };
}
