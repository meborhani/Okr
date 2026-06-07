export declare const apiClient: import("axios").AxiosInstance;
export declare function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T>;
export declare function apiPost<T>(url: string, data?: unknown): Promise<T>;
export declare function apiPatch<T>(url: string, data?: unknown): Promise<T>;
export declare function apiDelete<T>(url: string): Promise<T>;
