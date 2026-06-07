"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDashboard = useDashboard;
const react_query_1 = require("@tanstack/react-query");
const okr_api_1 = require("@/lib/api/okr.api");
function useDashboard(periodId) {
    const dashboard = (0, react_query_1.useQuery)({
        queryKey: ['dashboard', periodId],
        queryFn: () => okr_api_1.reportsApi.getDashboard(periodId),
    });
    const activePeriods = (0, react_query_1.useQuery)({
        queryKey: ['periods', 'active'],
        queryFn: okr_api_1.periodsApi.getActive,
    });
    return { dashboard, activePeriods };
}
//# sourceMappingURL=useDashboard.js.map