"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Badge = Badge;
function Badge({ children, className = '' }) {
    return (<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>);
}
//# sourceMappingURL=Badge.js.map