import type { OkrPeriod } from '@/types';
interface Props {
    open: boolean;
    onClose: () => void;
    period: OkrPeriod;
}
export declare function EditPeriodModal({ open, onClose, period }: Props): import("react").JSX.Element;
export {};
