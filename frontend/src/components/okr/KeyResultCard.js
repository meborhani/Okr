"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyResultCard = KeyResultCard;
const react_router_dom_1 = require("react-router-dom");
const lucide_react_1 = require("lucide-react");
const Card_1 = require("@/components/ui/Card");
const Badge_1 = require("@/components/ui/Badge");
const ProgressBar_1 = require("@/components/ui/ProgressBar");
const status_1 = require("@/lib/utils/status");
function KeyResultCard({ keyResult }) {
    const navigate = (0, react_router_dom_1.useNavigate)();
    return (<Card_1.Card hoverable onClick={() => navigate(`/key-results/${keyResult.id}`)}>
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <h3 className="font-medium text-gray-900 text-sm leading-snug flex-1">{keyResult.title}</h3>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Badge_1.Badge className={status_1.krStatusColor[keyResult.status]}>
            {status_1.krStatusLabel[keyResult.status]}
          </Badge_1.Badge>
          <lucide_react_1.ChevronLeft size={16} className="text-gray-300"/>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
        <span>
          {keyResult.currentValue.toLocaleString('fa-IR')}
          {keyResult.unit ? ` ${keyResult.unit}` : ''}
        </span>
        <span className="font-medium text-gray-700">{Math.round(keyResult.progress)}٪</span>
        <span>
          {keyResult.targetValue.toLocaleString('fa-IR')}
          {keyResult.unit ? ` ${keyResult.unit}` : ''}
        </span>
      </div>

      <ProgressBar_1.ProgressBar value={keyResult.progress} colorClass={status_1.krProgressColor[keyResult.status]} size="sm"/>
    </Card_1.Card>);
}
//# sourceMappingURL=KeyResultCard.js.map