import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/layout/ThemeProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Bridge Capital — Trade Crypto, Stocks & ETFs',
  description:
    'Enterprise-grade multi-asset trading platform. Trade Bitcoin, Ethereum, US stocks, and ETFs with institutional-grade security and real-time market data.',
  keywords: ['crypto', 'trading', 'stocks', 'ETFs', 'bitcoin', 'ethereum', 'investment'],
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0A0B0D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-[#0A0B0D] text-[#E6EDF3] antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#161B22',
              border: '1px solid #21262D',
              color: '#E6EDF3',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#22C55E', secondary: '#161B22' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#161B22' } },
          }}
        />
      </body>
    </html>
  );
}
