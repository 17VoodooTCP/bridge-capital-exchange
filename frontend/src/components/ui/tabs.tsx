'use client';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: React.ReactNode;
  count?: number;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange?: (id: string) => void;
  defaultTab?: string;
  variant?: 'default' | 'pills' | 'underline' | 'bordered';
  className?: string;
  tabClassName?: string;
  children?: React.ReactNode;
}

export function Tabs({
  tabs,
  activeTab: controlledTab,
  onChange,
  defaultTab,
  variant = 'default',
  className,
  tabClassName,
  children,
}: TabsProps) {
  const [internalTab, setInternalTab] = useState(defaultTab || tabs[0]?.id);
  const active = controlledTab ?? internalTab;

  const handleChange = (id: string) => {
    setInternalTab(id);
    onChange?.(id);
  };

  const containerStyles = {
    default: 'flex gap-1 bg-[#111318] border border-[#21262D] rounded-xl p-1',
    pills: 'flex gap-2',
    underline: 'flex border-b border-[#21262D]',
    bordered: 'flex border-b border-[#21262D] gap-4',
  };

  const tabStyles = {
    default: {
      base: 'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer',
      active: 'bg-[#21262D] text-[#E6EDF3] shadow-sm',
      inactive: 'text-[#8B949E] hover:text-[#E6EDF3]',
    },
    pills: {
      base: 'px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 cursor-pointer',
      active: 'bg-amber-500 text-black',
      inactive: 'bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3]',
    },
    underline: {
      base: 'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all duration-200 cursor-pointer',
      active: 'border-amber-500 text-amber-400',
      inactive: 'border-transparent text-[#8B949E] hover:text-[#E6EDF3] hover:border-[#30363D]',
    },
    bordered: {
      base: 'pb-3 text-sm font-medium border-b-2 -mb-px transition-all duration-200 cursor-pointer',
      active: 'border-amber-500 text-[#E6EDF3]',
      inactive: 'border-transparent text-[#8B949E] hover:text-[#E6EDF3]',
    },
  };

  const styles = tabStyles[variant];

  return (
    <div className={className}>
      <div className={cn(containerStyles[variant], tabClassName)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && handleChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              styles.base,
              active === tab.id ? styles.active : styles.inactive,
              tab.disabled && 'opacity-40 cursor-not-allowed',
              'flex items-center gap-2'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full font-semibold',
                  active === tab.id
                    ? 'bg-black/20 text-current'
                    : 'bg-[#21262D] text-[#8B949E]'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}
