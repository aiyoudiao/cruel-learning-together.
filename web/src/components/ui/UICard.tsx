import React from 'react';

interface UICardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function UICard({ children, className = '', hover = true }: UICardProps) {
  return (
    <div 
      className={`
        bg-solana-surface/60 backdrop-blur-xl
        border border-white/5 rounded-2xl p-6 relative overflow-hidden
        before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:opacity-0 before:transition-opacity
        ${hover ? 'hover:before:opacity-100 hover:border-solana-primary/30 hover:shadow-neon-purple/20 hover:-translate-y-1 transition-all duration-300' : ''}
        ${className}
      `}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
