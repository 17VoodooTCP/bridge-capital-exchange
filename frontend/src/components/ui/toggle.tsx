'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { track: 'w-8 h-4', thumb: 'w-3 h-3 translate-x-0.5', checked: 'translate-x-4' },
  md: { track: 'w-10 h-5', thumb: 'w-4 h-4 translate-x-0.5', checked: 'translate-x-5' },
  lg: { track: 'w-12 h-6', thumb: 'w-5 h-5 translate-x-0.5', checked: 'translate-x-6' },
};

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
  size = 'md',
  className,
}: ToggleProps) {
  const s = sizeMap[size];

  return (
    <label
      className={cn(
        'flex items-center gap-3 cursor-pointer select-none',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <div className="relative shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={cn(
            'rounded-full transition-colors duration-200',
            s.track,
            checked ? 'bg-amber-500' : 'bg-[#21262D]'
          )}
        />
        <div
          className={cn(
            'absolute top-0.5 rounded-full bg-white shadow-sm transition-transform duration-200',
            s.thumb,
            checked && s.checked
          )}
        />
      </div>
      {(label || description) && (
        <div>
          {label && (
            <p className="text-sm font-medium text-[#E6EDF3]">{label}</p>
          )}
          {description && (
            <p className="text-xs text-[#8B949E] mt-0.5">{description}</p>
          )}
        </div>
      )}
    </label>
  );
}
