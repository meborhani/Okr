import type { ReactNode } from 'react';
interface TopBarProps {
    title: string;
    showBack?: boolean;
    right?: ReactNode;
}
export declare function TopBar({ title, showBack, right }: TopBarProps): import("react").JSX.Element;
export {};
