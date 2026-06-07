"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorState = ErrorState;
const lucide_react_1 = require("lucide-react");
const Button_1 = require("./Button");
function ErrorState({ message = 'مشکلی در بارگذاری اطلاعات پیش آمد', onRetry, }) {
    return (<div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-14 h-14 rounded-full bg-danger-50 flex items-center justify-center mb-4">
        <lucide_react_1.AlertCircle size={28} className="text-danger-500"/>
      </div>
      <p className="font-semibold text-gray-700">خطا</p>
      <p className="text-sm text-gray-400 mt-1 max-w-xs">{message}</p>
      {onRetry && (<div className="mt-4">
          <Button_1.Button variant="secondary" size="sm" onClick={onRetry}>
            تلاش مجدد
          </Button_1.Button>
        </div>)}
    </div>);
}
//# sourceMappingURL=ErrorState.js.map