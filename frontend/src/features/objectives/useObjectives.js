"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMyObjectives = useMyObjectives;
exports.useObjective = useObjective;
exports.useObjectiveKeyResults = useObjectiveKeyResults;
const react_query_1 = require("@tanstack/react-query");
const okr_api_1 = require("@/lib/api/okr.api");
const auth_store_1 = require("@/lib/auth/auth.store");
function useMyObjectives(periodId) {
    const { user } = (0, auth_store_1.useAuthStore)();
    return (0, react_query_1.useQuery)({
        queryKey: ['objectives', 'mine', periodId],
        queryFn: () => okr_api_1.objectivesApi.getAll({ periodId, ownerId: user?.id }),
        enabled: !!user?.id,
    });
}
function useObjective(id) {
    return (0, react_query_1.useQuery)({
        queryKey: ['objectives', id],
        queryFn: () => okr_api_1.objectivesApi.getById(id),
        enabled: !!id,
    });
}
function useObjectiveKeyResults(objectiveId) {
    return (0, react_query_1.useQuery)({
        queryKey: ['key-results', 'by-objective', objectiveId],
        queryFn: () => okr_api_1.keyResultsApi.getAll({ objectiveId }),
        enabled: !!objectiveId,
    });
}
//# sourceMappingURL=useObjectives.js.map