"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quarterNames = void 0;
exports.formatDate = formatDate;
exports.formatDateTime = formatDateTime;
exports.formatNumber = formatNumber;
exports.periodLabel = periodLabel;
function formatDate(dateStr) {
    if (!dateStr)
        return '—';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('fa-IR');
    }
    catch {
        return dateStr;
    }
}
function formatDateTime(dateStr) {
    if (!dateStr)
        return '—';
    try {
        const d = new Date(dateStr);
        return d.toLocaleString('fa-IR');
    }
    catch {
        return dateStr;
    }
}
function formatNumber(n) {
    if (n === null || n === undefined)
        return '۰';
    return n.toLocaleString('fa-IR');
}
exports.quarterNames = {
    1: 'بهار',
    2: 'تابستان',
    3: 'پاییز',
    4: 'زمستان',
};
function periodLabel(year, quarter) {
    return `${exports.quarterNames[quarter]} ${year}`;
}
//# sourceMappingURL=format.js.map