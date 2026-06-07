"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCheckIn = useCheckIn;
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const react_query_1 = require("@tanstack/react-query");
const okr_api_1 = require("@/lib/api/okr.api");
function useCheckIn() {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const navigate = (0, react_router_dom_1.useNavigate)();
    const queryClient = (0, react_query_1.useQueryClient)();
    const submit = async (data) => {
        setLoading(true);
        setError(null);
        try {
            await okr_api_1.checkInsApi.create(data);
            queryClient.invalidateQueries({ queryKey: ['key-results', data.keyResultId] });
            queryClient.invalidateQueries({ queryKey: ['check-ins', 'by-kr', data.keyResultId] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            navigate(-1);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'خطا در ثبت چک‌این');
        }
        finally {
            setLoading(false);
        }
    };
    return { submit, loading, error };
}
//# sourceMappingURL=useCheckIn.js.map