"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentQuarter = exports.currentShamsiYear = exports.quarterNames = void 0;
exports.getQuarterDates = getQuarterDates;
exports.getQuarterTitle = getQuarterTitle;
exports.quarterNames = {
    1: 'بهار', 2: 'تابستان', 3: 'پاییز', 4: 'زمستان',
};
function getQuarterDates(shamsiYear, quarter) {
    const g = shamsiYear + 621;
    const ranges = {
        1: { start: `${g}-03-21`, end: `${g}-06-21` },
        2: { start: `${g}-06-22`, end: `${g}-09-22` },
        3: { start: `${g}-09-23`, end: `${g}-12-21` },
        4: { start: `${g}-12-22`, end: `${g + 1}-03-20` },
    };
    return ranges[quarter];
}
function getQuarterTitle(shamsiYear, quarter) {
    return `${exports.quarterNames[quarter]} ${shamsiYear}`;
}
const currentShamsiYear = () => {
    const now = new Date();
    const g = now.getFullYear();
    const monthDay = now.getMonth() * 100 + now.getDate();
    return monthDay >= 320 ? g - 621 : g - 622;
};
exports.currentShamsiYear = currentShamsiYear;
const currentQuarter = () => {
    const now = new Date();
    const m = now.getMonth() + 1;
    if (m >= 3 && m <= 6)
        return 1;
    if (m >= 6 && m <= 9)
        return 2;
    if (m >= 9 && m <= 12)
        return 3;
    return 4;
};
exports.currentQuarter = currentQuarter;
//# sourceMappingURL=shamsi.js.map