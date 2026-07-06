import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: number;
  className?: string;
  rounded?: boolean;
}

export function Logo({ size = 36, className, rounded = true }: LogoProps) {
  return (
    <img
      src="/logo.svg"
      alt="Bridge Capital Exchange"
      width={size}
      height={size}
      className={cn('object-contain', rounded && 'rounded-lg', className)}
      style={{ width: size, height: size }}
    />
  );
}
