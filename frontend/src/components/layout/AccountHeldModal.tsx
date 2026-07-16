'use client';
import { useState, useEffect } from 'react';
import { ShieldAlert, Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Listens for the global 'account-held' event (dispatched by the API layer
 * when a held user attempts a transaction) and shows the admin's reason plus
 * a support-contact prompt. Held users can browse, but not move funds.
 */
export function AccountHeldModal() {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    const handler = (e: Event) => {
      setReason((e as CustomEvent).detail || 'Your account is currently under review.');
      setOpen(true);
    };
    window.addEventListener('account-held', handler);
    return () => window.removeEventListener('account-held', handler);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-md bg-[#161B22] border border-red-500/30 rounded-2xl p-8 text-center">
        <button onClick={() => setOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg text-[#8B949E] hover:text-[#E6EDF3] hover:bg-white/5"><X size={16} /></button>
        <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-5">
          <ShieldAlert size={30} className="text-red-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">Account Restricted</h2>
        <p className="text-sm text-[#8B949E] mb-4">
          This action isn&apos;t available because your account is currently on hold. You can still sign in and view your account.
        </p>
        {reason && (
          <div className="text-left rounded-xl bg-[#0D1117] border border-[#21262D] p-4 mb-5">
            <div className="text-xs text-[#8B949E] uppercase tracking-wide mb-1">Reason</div>
            <div className="text-sm text-[#E6EDF3]">{reason}</div>
          </div>
        )}
        <a href="mailto:support@bridgecapitalv1.com?subject=Account%20Restriction%20Appeal">
          <Button fullWidth leftIcon={<Mail size={16} />}>Contact Support</Button>
        </a>
        <p className="text-xs text-[#6E7681] mt-3">support@bridgecapitalv1.com</p>
      </div>
    </div>
  );
}
