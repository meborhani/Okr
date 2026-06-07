import { type ReactNode } from 'react';
interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
}
export declare function Modal({ open, onClose, title, children }: ModalProps): import("react").JSX.Element;
export {};
