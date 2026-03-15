import React from 'react';

interface UIBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

export function UIBadge({ children, variant = 'default', className = '' }: UIBadgeProps) {
  const variants = {
    default: 'bg-solana-primary/20 text-solana-primary border-solana-primary/50',
    success: 'bg-solana-secondary/20 text-solana-secondary border-solana-secondary/50',
    warning: 'bg-cyberpunk-yellow/20 text-cyberpunk-yellow border-cyberpunk-yellow/50',
    error: 'bg-cyberpunk-pink/20 text-cyberpunk-pink border-cyberpunk-pink/50',
  };

  return (
    <span 
      className={`
        px-2.5 py-0.5 rounded-full text-xs font-medium border
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
