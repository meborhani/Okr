"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectiveCard = ObjectiveCard;
const react_router_dom_1 = require("react-router-dom");
const lucide_react_1 = require("lucide-react");
const Card_1 = require("@/components/ui/Card");
const Badge_1 = require("@/components/ui/Badge");
const ProgressBar_1 = require("@/components/ui/ProgressBar");
const status_1 = require("@/lib/utils/status");
function ObjectiveCard({ objective }) {
    const navigate = (0, react_router_dom_1.useNavigate)();
    return (<Card_1.Card hoverable onClick={() => navigate(`/objectives/${objective.id}`)}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug truncate">
            {objective.title}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">{objective.periodTitle}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Badge_1.Badge className={status_1.objectiveStatusColor[objective.status]}>
            {status_1.objectiveStatusLabel[objective.status]}
          </Badge_1.Badge>
          <lucide_react_1.ChevronLeft size={16} className="text-gray-300"/>
        </div>
      </div>

      <ProgressBar_1.ProgressBar value={objective.progress} showLabel colorClass={objective.progress >= 70
            ? 'bg-success-500'
            : objective.progress >= 40
                ? 'bg-primary-500'
                : 'bg-warning-500'}/>

      {(objective.teamName || objective.departmentName) && (<p className="text-xs text-gray-400 mt-2">
          {objective.teamName || objective.departmentName}
        </p>)}
    </Card_1.Card>);
}
//# sourceMappingURL=ObjectiveCard.js.map