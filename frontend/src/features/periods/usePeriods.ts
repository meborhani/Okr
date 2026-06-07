import { useQuery } from '@tanstack/react-query';
import { periodsApiExt } from './periods.api';

export function usePeriods() {
  return useQuery({
    queryKey: ['periods'],
    queryFn: periodsApiExt.getAll,
  });
}
