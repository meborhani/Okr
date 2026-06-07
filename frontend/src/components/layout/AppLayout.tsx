import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export function AppLayout() {
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
