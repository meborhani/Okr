export declare const periodsApiExt: {
    getAll: () => any;
    getActive: () => any;
    create: (data: {
        title: string;
        year: number;
        quarter: number;
        startDate: string;
        endDate: string;
        description?: string;
    }) => any;
    update: (id: string, data: {
        title?: string;
        startDate?: string;
        endDate?: string;
        description?: string;
    }) => any;
    activate: (id: string) => any;
    close: (id: string) => any;
    archive: (id: string) => any;
};
