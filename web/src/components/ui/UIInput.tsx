import React from 'react';

interface UIInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function UIInput({ label, className = '', ...props }: UIInputProps) {
  return (
    <div className="flex flex-col gap-2 group">
      {label && <label className="text-xs font-bold text-gray-400 uppercase tracking-wider group-focus-within:text-solana-primary transition-colors">{label}</label>}
      <input
        className={`
          bg-solana-surface/40 border border-white/10 rounded-lg px-4 py-3
          text-white placeholder-gray-600 font-mono text-sm
          focus:outline-none focus:border-solana-primary focus:ring-1 focus:ring-solana-primary/50
          hover:border-white/20
          transition-all duration-300
          backdrop-blur-sm
          ${className}
        `}
        {...props}
      />
    </div>
  );
}
