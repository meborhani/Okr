"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useKeyResult = useKeyResult;
exports.useKeyResultCheckIns = useKeyResultCheckIns;
const react_query_1 = require("@tanstack/react-query");
const okr_api_1 = require("@/lib/api/okr.api");
function useKeyResult(id) {
    return (0, react_query_1.useQuery)({
        queryKey: ['key-results', id],
        queryFn: () => okr_api_1.keyResultsApi.getById(id),
        enabled: !!id,
    });
}
function useKeyResultCheckIns(id) {
    return (0, react_query_1.useQuery)({
        queryKey: ['check-ins', 'by-kr', id],
        queryFn: () => okr_api_1.keyResultsApi.getCheckIns(id),
        enabled: !!id,
    });
}
//# sourceMappingURL=useKeyResults.js.map