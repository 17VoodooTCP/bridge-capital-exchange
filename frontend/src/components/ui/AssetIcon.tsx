'use client';
import { useState } from 'react';
import { getAssetLogo } from '@/lib/logos';
import { cn } from '@/lib/utils';

interface AssetIconProps {
  symbol: string;
  /** Emoji fallback shown if no logo URL exists or the image fails to load */
  fallback?: string;
  size?: number;
  className?: string;
}

export function AssetIcon({ symbol, fallback, size = 36, className }: AssetIconProps) {
  const [failed, setFailed] = useState(false);
  const url = getAssetLogo(symbol);

  if (!url || failed) {
    return (
      <div
        className={cn('rounded-full bg-[#21262D] flex items-center justify-center shrink-0', className)}
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        {fallback || symbol.slice(0, 2)}
      </div>
    );
  }

  return (
    <div
      className={cn('rounded-full bg-white/5 flex items-center justify-center overflow-hidden shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <img
        src={url}
        alt={symbol}
        width={size - 6}
        height={size - 6}
        className="object-contain rounded-full"
        onError={() => setFailed(true)}
        loading="lazy"
      />
    </div>
  );
}
