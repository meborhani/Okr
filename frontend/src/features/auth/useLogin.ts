import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/lib/auth/auth.store';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authApi.login(email, password);
      setAuth(result.user, result.accessToken);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در ورود';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
