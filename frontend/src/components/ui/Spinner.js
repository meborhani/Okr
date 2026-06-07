"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spinner = Spinner;
exports.PageSpinner = PageSpinner;
const lucide_react_1 = require("lucide-react");
function Spinner({ size = 24, className = '' }) {
    return (<div className={`flex items-center justify-center ${className}`}>
      <lucide_react_1.Loader2 size={size} className="animate-spin text-primary-500"/>
    </div>);
}
function PageSpinner() {
    return (<div className="flex items-center justify-center min-h-[50vh]">
      <Spinner size={32}/>
    </div>);
}
//# sourceMappingURL=Spinner.js.map