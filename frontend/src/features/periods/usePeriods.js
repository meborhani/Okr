"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePeriods = usePeriods;
const react_query_1 = require("@tanstack/react-query");
const periods_api_1 = require("./periods.api");
function usePeriods() {
    return (0, react_query_1.useQuery)({
        queryKey: ['periods'],
        queryFn: periods_api_1.periodsApiExt.getAll,
    });
}
//# sourceMappingURL=usePeriods.js.map