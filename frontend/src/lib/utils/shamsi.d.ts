export declare const quarterNames: Record<number, string>;
export declare function getQuarterDates(shamsiYear: number, quarter: number): {
    start: string;
    end: string;
};
export declare function getQuarterTitle(shamsiYear: number, quarter: number): string;
export declare const currentShamsiYear: () => number;
export declare const currentQuarter: () => number;
