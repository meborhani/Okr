import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  right?: ReactNode;
}

export function TopBar({ title, showBack, right }: TopBarProps) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-surface-200">
      <div className="flex items-center h-14 px-4 gap-3">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 -mr-1 rounded-xl hover:bg-surface-100 transition-colors"
          >
            <ArrowRight size={20} className="text-gray-600" />
          </button>
        )}
        <h1 className="flex-1 text-base font-bold text-gray-900 truncate">{title}</h1>
        {right && <div className="flex items-center gap-2">{right}</div>}
      </div>
    </header>
  );
}
