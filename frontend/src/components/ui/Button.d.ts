import type { ButtonHTMLAttributes, ReactNode } from 'react';
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    fullWidth?: boolean;
}
export declare function Button({ children, variant, size, loading, fullWidth, disabled, className, ...props }: ButtonProps): import("react").JSX.Element;
export {};
