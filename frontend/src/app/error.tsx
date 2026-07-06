'use client';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0B0D] text-[#E6EDF3] p-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center mb-5">
          <AlertTriangle size={28} className="text-amber-400" />
        </div>
        <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
        <p className="text-sm text-[#8B949E] mb-6">
          An unexpected error occurred. Your funds and account are safe — try reloading the page.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400 transition-colors"
          >
            <RefreshCw size={15} /> Try Again
          </button>
          <a
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#21262D] text-sm text-[#E6EDF3] hover:border-amber-500/40 transition-colors"
          >
            <Home size={15} /> Home
          </a>
        </div>
        {error?.digest && <p className="text-xs text-[#6E7681] mt-6">Error ID: {error.digest}</p>}
      </div>
    </div>
  );
}
