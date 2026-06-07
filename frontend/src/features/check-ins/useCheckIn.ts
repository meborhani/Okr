import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { checkInsApi } from '@/lib/api/okr.api';

export function useCheckIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const submit = async (data: {
    keyResultId: string;
    value: number;
    note?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      await checkInsApi.create(data);
      queryClient.invalidateQueries({ queryKey: ['key-results', data.keyResultId] });
      queryClient.invalidateQueries({ queryKey: ['check-ins', 'by-kr', data.keyResultId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate(-1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'خطا در ثبت چک‌این');
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
}
