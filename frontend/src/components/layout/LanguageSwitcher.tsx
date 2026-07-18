'use client';
import { useEffect, useRef, useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { LANGUAGES, flagUrl } from '@/lib/countries';
import { cn } from '@/lib/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

/**
 * On-site world translator. A custom flag dropdown drives Google Translate's
 * website widget (100+ languages) via the `googtrans` cookie, so the whole page
 * is translated into the visitor's chosen language. The Google element itself
 * is mounted hidden; we only render our own styled control.
 */
export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('en');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reflect the language already stored in the cookie
    const m = document.cookie.match(/googtrans=\/[^/]+\/([^;]+)/);
    if (m) setCurrent(decodeURIComponent(m[1]));

    // Load the Google Translate engine once
    if (!document.getElementById('google-translate-script')) {
      window.googleTranslateElementInit = () => {
        try {
          // eslint-disable-next-line new-cap
          new window.google.translate.TranslateElement(
            { pageLanguage: 'en', autoDisplay: false },
            'google_translate_element',
          );
        } catch { /* engine not ready — ignored */ }
      };
      const s = document.createElement('script');
      s.id = 'google-translate-script';
      s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(s);
    }

    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const choose = (code: string) => {
    const host = window.location.hostname;
    const expire = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
    if (code === 'en') {
      // Clear the cookie on every scope to restore the original language
      document.cookie = `googtrans=;path=/;${expire}`;
      document.cookie = `googtrans=;path=/;domain=${host};${expire}`;
      document.cookie = `googtrans=;path=/;domain=.${host};${expire}`;
    } else {
      const value = `/en/${code}`;
      document.cookie = `googtrans=${value};path=/`;
      document.cookie = `googtrans=${value};path=/;domain=${host}`;
      document.cookie = `googtrans=${value};path=/;domain=.${host}`;
    }
    window.location.reload();
  };

  const active = LANGUAGES.find((l) => l.code === current) || LANGUAGES[0];

  return (
    <div className="relative" ref={ref}>
      {/* Hidden engine mount — never shown to the user */}
      <div id="google_translate_element" style={{ display: 'none' }} />

      <button
        onClick={() => setOpen(!open)}
        aria-label="Change language"
        className={cn(
          'flex items-center gap-1.5 rounded-lg text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] transition-colors',
          compact ? 'p-2' : 'px-2.5 py-2',
        )}
        translate="no"
      >
        <img src={flagUrl(active.iso, 20)} alt="" width={20} height={15} className="rounded-sm" />
        {!compact && <span className="text-sm hidden sm:inline">{active.name}</span>}
        <ChevronDown size={13} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 max-h-80 overflow-y-auto bg-[#161B22] border border-[#21262D] rounded-xl shadow-modal z-50 animate-slide-in p-1" translate="no">
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-[#6E7681] border-b border-[#21262D] mb-1">
            <Globe size={13} /> Select language
          </div>
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => choose(l.code)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors',
                l.code === current ? 'bg-amber-500/10 text-amber-400' : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D]',
              )}
            >
              <img src={flagUrl(l.iso, 20)} alt="" width={20} height={15} className="rounded-sm shrink-0" />
              {l.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
