'use client';
import { useTheme } from '@/hooks/useTheme';

/** Mounts the theme store and applies the .dark/.light class to <html>. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useTheme();
  return <>{children}</>;
}
