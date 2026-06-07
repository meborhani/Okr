export declare const authApi: {
    login: (email: string, password: string) => Promise<LoginResponse>;
    me: () => Promise<User>;
};
