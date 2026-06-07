import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, className = '', onClick, hoverable }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-card p-4 ${
        hoverable ? 'cursor-pointer hover:shadow-card-hover transition-shadow active:scale-[0.99]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
