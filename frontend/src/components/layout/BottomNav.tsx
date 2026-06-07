import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Target, BarChart3, Calendar } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'داشبورد' },
  { to: '/my-okrs', icon: Target, label: 'OKR من' },
  { to: '/periods', icon: Calendar, label: 'دوره‌ها' },
  { to: '/reports', icon: BarChart3, label: 'گزارش' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-surface-200 safe-area-pb md:hidden">
      <div className="flex items-stretch h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 text-xs transition-colors ${isActive ? 'text-primary-600' : 'text-gray-400'}`}>
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-primary-50' : ''}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span className={`font-medium ${isActive ? 'text-primary-600' : ''}`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
