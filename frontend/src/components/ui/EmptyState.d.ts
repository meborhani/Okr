import type { ReactNode } from 'react';
interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
}
export declare function EmptyState({ title, description, icon, action, }: EmptyStateProps): import("react").JSX.Element;
export {};
