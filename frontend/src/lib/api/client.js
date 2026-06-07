"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = void 0;
exports.apiGet = apiGet;
exports.apiPost = apiPost;
exports.apiPatch = apiPatch;
exports.apiDelete = apiDelete;
const axios_1 = require("axios");
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
exports.apiClient = axios_1.default.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});
exports.apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token)
        config.headers.Authorization = `Bearer ${token}`;
    return config;
});
exports.apiClient.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});
async function apiGet(url, params) {
    const res = await exports.apiClient.get(url, { params });
    if (!res.data.success)
        throw new Error(res.data.message);
    return res.data.data;
}
async function apiPost(url, data) {
    const res = await exports.apiClient.post(url, data);
    if (!res.data.success)
        throw new Error(res.data.message);
    return res.data.data;
}
async function apiPatch(url, data) {
    const res = await exports.apiClient.patch(url, data);
    if (!res.data.success)
        throw new Error(res.data.message);
    return res.data.data;
}
async function apiDelete(url) {
    const res = await exports.apiClient.delete(url);
    if (!res.data.success)
        throw new Error(res.data.message);
    return res.data.data;
}
//# sourceMappingURL=client.js.map