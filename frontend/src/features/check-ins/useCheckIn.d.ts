export declare function useCheckIn(): {
    submit: (data: {
        keyResultId: string;
        value: number;
        note?: string;
    }) => Promise<void>;
    loading: boolean;
    error: string;
};
