interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
}
export declare function ErrorState({ message, onRetry, }: ErrorStateProps): import("react").JSX.Element;
export {};
