import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useAuthStore } from '@/lib/auth/auth.store';
import { authApi } from '@/lib/api/auth.api';

export function AppLayout() {
  const { user, token, setUser } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      authApi.me().then(setUser).catch(() => {});
    }
  }, [token, user, setUser]);

  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar />
      {/* md:mr-60 = shift content left of the 240px right-side sidebar in RTL */}
      <div className="md:mr-60">
        <main className="pb-20 md:pb-8 min-h-screen">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
