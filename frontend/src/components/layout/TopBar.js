"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopBar = TopBar;
const react_router_dom_1 = require("react-router-dom");
const lucide_react_1 = require("lucide-react");
function TopBar({ title, showBack, right }) {
    const navigate = (0, react_router_dom_1.useNavigate)();
    return (<header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-surface-200">
      <div className="flex items-center h-14 px-4 gap-3">
        {showBack && (<button onClick={() => navigate(-1)} className="p-1.5 -mr-1 rounded-xl hover:bg-surface-100 transition-colors">
            <lucide_react_1.ArrowRight size={20} className="text-gray-600"/>
          </button>)}
        <h1 className="flex-1 text-base font-bold text-gray-900 truncate">{title}</h1>
        {right && <div className="flex items-center gap-2">{right}</div>}
      </div>
    </header>);
}
//# sourceMappingURL=TopBar.js.map