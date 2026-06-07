"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = Card;
function Card({ children, className = '', onClick, hoverable }) {
    return (<div onClick={onClick} className={`bg-white rounded-2xl shadow-card p-4 ${hoverable ? 'cursor-pointer hover:shadow-card-hover transition-shadow active:scale-[0.99]' : ''} ${className}`}>
      {children}
    </div>);
}
//# sourceMappingURL=Card.js.map