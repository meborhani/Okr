"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sidebar = Sidebar;
const react_router_dom_1 = require("react-router-dom");
const lucide_react_1 = require("lucide-react");
const auth_store_1 = require("@/lib/auth/auth.store");
const baseItems = [
    { to: '/dashboard', icon: lucide_react_1.LayoutDashboard, label: 'داشبورد' },
    { to: '/my-okrs', icon: lucide_react_1.Target, label: 'OKR من' },
    { to: '/objectives', icon: lucide_react_1.TrendingUp, label: 'همه اهداف' },
    { to: '/periods', icon: lucide_react_1.Calendar, label: 'دوره‌ها' },
    { to: '/reports', icon: lucide_react_1.BarChart3, label: 'گزارش���ها' },
];
function Sidebar() {
    const { user, logout } = (0, auth_store_1.useAuthStore)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const navItems = [
        ...baseItems,
        ...(user?.permissions?.includes('users:read')
            ? [{ to: '/users', icon: lucide_react_1.Users, label: 'کاربران' }]
            : []),
    ];
    return (<aside className="hidden md:flex md:fixed md:top-0 md:bottom-0 md:right-0 md:w-60 bg-white border-l border-surface-200 flex-col z-40">
      
      <div className="h-16 flex items-center px-5 border-b border-surface-200 flex-shrink-0">
        <span className="text-primary-600 font-bold text-lg tracking-tight">OKR Manager</span>
      </div>

      
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (<react_router_dom_1.NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-surface-100 hover:text-gray-900'}`}>
            {({ isActive }) => (<>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8}/>
                {label}
              </>)}
          </react_router_dom_1.NavLink>))}
      </nav>

      
      <div className="border-t border-surface-200 p-3 flex-shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs flex-shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.roleDisplayName || user?.roleName}</p>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-danger-50 hover:text-danger-600 transition-colors">
          <lucide_react_1.LogOut size={15}/>
          خروج از سیستم
        </button>
      </div>
    </aside>);
}
//# sourceMappingURL=Sidebar.js.map