import type { ReactNode } from 'react';
interface CardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    hoverable?: boolean;
}
export declare function Card({ children, className, onClick, hoverable }: CardProps): import("react").JSX.Element;
export {};
