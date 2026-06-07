"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuthStore = void 0;
const zustand_1 = require("zustand");
const storedToken = localStorage.getItem('access_token');
exports.useAuthStore = (0, zustand_1.create)((set) => ({
    user: null,
    token: storedToken,
    isAuthenticated: !!storedToken,
    setAuth: (user, token) => {
        localStorage.setItem('access_token', token);
        set({ user, token, isAuthenticated: true });
    },
    setUser: (user) => set({ user }),
    logout: () => {
        localStorage.removeItem('access_token');
        set({ user: null, token: null, isAuthenticated: false });
    },
}));
//# sourceMappingURL=auth.store.js.map