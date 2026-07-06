'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  glow?: 'gold' | 'green' | 'red' | 'none';
}

export function Card({ children, className, onClick, hover = false, glow = 'none' }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-[#161B22] border border-[#21262D] rounded-xl',
        hover && 'cursor-pointer transition-all duration-200 hover:border-[#30363D] hover:bg-[#1C2128]',
        glow === 'gold' && 'border-amber-500/30 shadow-gold',
        glow === 'green' && 'border-green-500/30',
        glow === 'red' && 'border-red-500/30',
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('px-5 py-4 border-b border-[#21262D]', className)}>
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={cn('p-5', className)}>{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('px-5 py-4 border-t border-[#21262D]', className)}>
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  subValueColor?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  subValue,
  subValueColor,
  icon,
  iconBg,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[#8B949E] font-medium uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold text-[#E6EDF3] mt-1">{value}</p>
          {subValue && (
            <p className={cn('text-sm mt-1', subValueColor || 'text-[#8B949E]')}>{subValue}</p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center text-lg',
              iconBg || 'bg-amber-500/10'
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
