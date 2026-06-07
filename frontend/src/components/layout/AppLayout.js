"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppLayout = AppLayout;
const react_router_dom_1 = require("react-router-dom");
const Sidebar_1 = require("./Sidebar");
const BottomNav_1 = require("./BottomNav");
function AppLayout() {
    return (<div className="min-h-screen bg-surface-50">
      <Sidebar_1.Sidebar />
      
      <div className="md:mr-60">
        <main className="pb-20 md:pb-8 min-h-screen">
          <react_router_dom_1.Outlet />
        </main>
      </div>
      <BottomNav_1.BottomNav />
    </div>);
}
//# sourceMappingURL=AppLayout.js.map