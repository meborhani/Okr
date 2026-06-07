export declare function useLogin(): {
    login: (email: string, password: string) => Promise<void>;
    loading: boolean;
    error: string;
};
