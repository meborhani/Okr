"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authApi = void 0;
const client_1 = require("./client");
exports.authApi = {
    login: (email, password) => (0, client_1.apiPost)('/auth/login', { email, password }),
    me: () => (0, client_1.apiGet)('/auth/me'),
};
//# sourceMappingURL=auth.api.js.map