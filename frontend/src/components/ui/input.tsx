'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  hint,
  prefix,
  suffix,
  containerClassName,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#8B949E]">
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex items-center gap-2',
          'bg-[#111318] border rounded-lg px-3 py-2.5',
          'transition-all duration-200',
          error
            ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-500/30'
            : 'border-[#21262D] focus-within:border-amber-500/60 focus-within:ring-2 focus-within:ring-amber-500/10'
        )}
      >
        {prefix && (
          <span className="shrink-0 text-[#8B949E] text-sm">{prefix}</span>
        )}
        <input
          id={inputId}
          className={cn(
            'flex-1 bg-transparent text-sm text-[#E6EDF3] outline-none',
            'placeholder:text-[#6E7681]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
        {suffix && (
          <span className="shrink-0 text-[#8B949E] text-sm">{suffix}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-[#6E7681]">{hint}</p>}
    </div>
  );
}
