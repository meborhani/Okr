"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentsApi = exports.teamsApi = exports.rolesApi = exports.usersApi = exports.reportsApi = exports.checkInsApi = exports.keyResultsApi = exports.objectivesApi = exports.periodsApi = void 0;
const client_1 = require("./client");
exports.periodsApi = {
    getAll: () => (0, client_1.apiGet)('/okr-periods'),
    getActive: () => (0, client_1.apiGet)('/okr-periods/active'),
    getById: (id) => (0, client_1.apiGet)(`/okr-periods/${id}`),
};
exports.objectivesApi = {
    getAll: (params) => (0, client_1.apiGet)('/objectives', params),
    getById: (id) => (0, client_1.apiGet)(`/objectives/${id}`),
    create: (data) => (0, client_1.apiPost)('/objectives', data),
};
exports.keyResultsApi = {
    getAll: (params) => (0, client_1.apiGet)('/key-results', params),
    getById: (id) => (0, client_1.apiGet)(`/key-results/${id}`),
    getCheckIns: (id) => (0, client_1.apiGet)(`/key-results/${id}/check-ins`),
    create: (data) => (0, client_1.apiPost)('/key-results', data),
};
exports.checkInsApi = {
    getAll: () => (0, client_1.apiGet)('/check-ins'),
    create: (data) => (0, client_1.apiPost)('/check-ins', data),
};
exports.reportsApi = {
    getDashboard: (periodId) => (0, client_1.apiGet)('/reports/dashboard', periodId ? { periodId } : undefined),
    getTeamProgress: (periodId) => (0, client_1.apiGet)('/reports/team-progress', periodId ? { periodId } : undefined),
    getUserProgress: (periodId) => (0, client_1.apiGet)('/reports/user-progress', periodId ? { periodId } : undefined),
};
exports.usersApi = {
    getAll: (page = 1, limit = 50) => (0, client_1.apiGet)('/users', { page, limit }),
    getById: (id) => (0, client_1.apiGet)(`/users/${id}`),
    create: (data) => (0, client_1.apiPost)('/users', data),
    update: (id, data) => (0, client_1.apiPatch)(`/users/${id}`, data),
    remove: (id) => (0, client_1.apiDelete)(`/users/${id}`),
};
exports.rolesApi = {
    getAll: () => (0, client_1.apiGet)('/roles'),
};
exports.teamsApi = {
    getAll: () => (0, client_1.apiGet)('/teams'),
};
exports.departmentsApi = {
    getAll: () => (0, client_1.apiGet)('/departments'),
};
//# sourceMappingURL=okr.api.js.map