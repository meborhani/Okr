"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtectedRoute = ProtectedRoute;
const react_router_dom_1 = require("react-router-dom");
const auth_store_1 = require("@/lib/auth/auth.store");
function ProtectedRoute({ children }) {
    const { isAuthenticated } = (0, auth_store_1.useAuthStore)();
    if (!isAuthenticated)
        return <react_router_dom_1.Navigate to="/login" replace/>;
    return <>{children}</>;
}
//# sourceMappingURL=ProtectedRoute.js.map