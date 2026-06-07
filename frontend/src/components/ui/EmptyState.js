"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptyState = EmptyState;
const lucide_react_1 = require("lucide-react");
function EmptyState({ title = 'موردی یافت نشد', description, icon, action, }) {
    return (<div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-14 h-14 rounded-full bg-surface-100 flex items-center justify-center mb-4">
        {icon || <lucide_react_1.Inbox size={28} className="text-gray-400"/>}
      </div>
      <p className="font-semibold text-gray-700">{title}</p>
      {description && <p className="text-sm text-gray-400 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>);
}
//# sourceMappingURL=EmptyState.js.map