"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.periodsApiExt = void 0;
const client_1 = require("@/lib/api/client");
exports.periodsApiExt = {
    getAll: () => (0, client_1.apiGet)('/okr-periods'),
    getActive: () => (0, client_1.apiGet)('/okr-periods/active'),
    create: (data) => (0, client_1.apiPost)('/okr-periods', data),
    update: (id, data) => (0, client_1.apiPatch)(`/okr-periods/${id}`, data),
    activate: (id) => (0, client_1.apiPost)(`/okr-periods/${id}/activate`),
    close: (id) => (0, client_1.apiPost)(`/okr-periods/${id}/close`),
    archive: (id) => (0, client_1.apiPost)(`/okr-periods/${id}/archive`),
};
//# sourceMappingURL=periods.api.js.map