import React from 'react';

interface UIButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export function UIButton({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  glow = false,
  className = '',
  ...props 
}: UIButtonProps) {
  const baseStyles = 'rounded-xl font-bold transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden';
  
  // Use theme variables for gradients
  const variants = {
    primary: 'bg-gradient-to-r from-solana-primary to-solana-secondary text-white border-none hover:shadow-neon-purple',
    secondary: 'bg-solana-secondary text-black hover:bg-opacity-80 hover:shadow-neon-green',
    outline: 'border border-solana-primary/50 text-solana-primary hover:border-solana-primary hover:bg-solana-primary/10',
    ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 hover:border-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-6 py-3 text-sm tracking-wide',
    lg: 'px-8 py-4 text-base tracking-wider',
  };

  const glowStyle = glow ? 'animate-pulse-slow' : '';

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${glowStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
