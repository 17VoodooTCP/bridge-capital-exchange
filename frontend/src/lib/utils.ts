import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  decimals?: number
): string {
  if (currency === 'USD' || currency === 'USDT' || currency === 'USDC') {
    const opts: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals ?? (amount < 1 ? 4 : 2),
      maximumFractionDigits: decimals ?? (amount < 1 ? 6 : 2),
    };
    return new Intl.NumberFormat('en-US', opts).format(amount);
  }
  return `${formatNumber(amount, decimals ?? 8)} ${currency}`;
}

export function formatPercent(value: number, decimals: number = 2): string {
  const formatted = Math.abs(value).toFixed(decimals);
  return `${value >= 0 ? '+' : '-'}${formatted}%`;
}

export function formatNumber(value: number, decimals?: number): string {
  if (value === 0) return '0';

  if (decimals !== undefined) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  if (value < 0.01) {
    return value.toFixed(6);
  }
  if (value < 1) {
    return value.toFixed(4);
  }
  return value.toFixed(2);
}

export function formatDate(
  date: string | Date,
  format: 'full' | 'short' | 'time' | 'relative' = 'short'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (format === 'relative') {
    const diff = Date.now() - d.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (format === 'time') {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  if (format === 'full') {
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function truncateAddress(address: string, start: number = 6, end: number = 4): string {
  if (!address || address.length < start + end + 3) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function getChangeColor(value: number): string {
  if (value > 0) return 'text-green-400';
  if (value < 0) return 'text-red-400';
  return 'text-gray-400';
}

export function getChangeBgColor(value: number): string {
  if (value > 0) return 'bg-green-400/10 text-green-400';
  if (value < 0) return 'bg-red-400/10 text-red-400';
  return 'bg-gray-400/10 text-gray-400';
}

export function generateSparklineData(
  baseValue: number,
  count: number = 20,
  volatility: number = 0.03
): number[] {
  const data: number[] = [];
  let v = baseValue;
  for (let i = 0; i < count; i++) {
    v = v * (1 + (Math.random() - 0.49) * volatility);
    data.push(parseFloat(v.toFixed(2)));
  }
  return data;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback
  const el = document.createElement('textarea');
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  return Promise.resolve();
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) return `$${(volume / 1_000_000_000).toFixed(2)}B`;
  if (volume >= 1_000_000) return `$${(volume / 1_000_000).toFixed(2)}M`;
  if (volume >= 1_000) return `$${(volume / 1_000).toFixed(2)}K`;
  return `$${volume.toFixed(2)}`;
}

export function calculateROI(
  principal: number,
  apr: number,
  days: number,
  compound: boolean = true
): { profit: number; total: number; daily: number; monthly: number } {
  if (compound) {
    const total = principal * Math.pow(1 + apr / 100 / 365, days);
    const profit = total - principal;
    return {
      profit,
      total,
      daily: profit / days,
      monthly: profit / (days / 30),
    };
  } else {
    const daily = (principal * (apr / 100)) / 365;
    const profit = daily * days;
    return {
      profit,
      total: principal + profit,
      daily,
      monthly: daily * 30,
    };
  }
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
