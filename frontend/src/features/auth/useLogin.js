"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLogin = useLogin;
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const auth_api_1 = require("@/lib/api/auth.api");
const auth_store_1 = require("@/lib/auth/auth.store");
function useLogin() {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const { setAuth } = (0, auth_store_1.useAuthStore)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const result = await auth_api_1.authApi.login(email, password);
            setAuth(result.user, result.accessToken);
            navigate('/dashboard');
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'خطا در ورود';
            setError(msg);
        }
        finally {
            setLoading(false);
        }
    };
    return { login, loading, error };
}
//# sourceMappingURL=useLogin.js.map