'use client';
import React, { useState } from 'react';
import { Wallet, ChevronDown, LogOut, Copy, CheckCircle2, PenLine, Loader2, ShieldCheck } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { truncateAddress, copyToClipboard, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const WALLETS = [
  { id: 'metamask', name: 'MetaMask', icon: '🦊', description: 'Connect using browser extension' },
  { id: 'trust', name: 'Trust Wallet', icon: '🛡️', description: 'Mobile & desktop wallet' },
  { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵', description: 'Coinbase self-custody wallet' },
  { id: 'rainbow', name: 'Rainbow', icon: '🌈', description: 'Fun, simple & secure' },
  { id: 'phantom', name: 'Phantom', icon: '👻', description: 'Solana & multi-chain wallet' },
  { id: 'walletconnect', name: 'WalletConnect', icon: '🔗', description: 'Connect via QR code' },
];

type Step = 'choose' | 'connecting' | 'approving' | 'connected';

export function WalletConnectButton({ className }: { className?: string }) {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<Step>('choose');
  const [walletId, setWalletId] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [signModal, setSignModal] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  const wallet = WALLETS.find((w) => w.id === walletId);

  const handleConnect = async (id: string) => {
    setWalletId(id);
    setStep('connecting');
    await new Promise((r) => setTimeout(r, 1400));
    setStep('approving');
    await new Promise((r) => setTimeout(r, 1600));
    const mockAddress = '0x742d35Cc6634C0532925a3b8D4C1C9f8e4f8a8b';
    setAddress(mockAddress);
    setStep('connected');
  };

  const finishConnect = () => {
    setShowModal(false);
    setStep('choose');
    toast.success(`${wallet?.name} connected — welcome to Bridge Capital!`, { duration: 4000 });
  };

  const handleDisconnect = () => {
    setAddress(null);
    setWalletId(null);
    setShowMenu(false);
    toast.success('Wallet disconnected safely');
  };

  const handleSign = async () => {
    setSigning(true);
    await new Promise((r) => setTimeout(r, 2200));
    setSigning(false);
    setSigned(true);
    setTimeout(() => {
      setSignModal(false);
      setSigned(false);
      toast.success('Transaction signed and broadcast ✓');
    }, 1600);
  };

  // ─── Connected state ────────────────────────────────────────────
  if (address) {
    return (
      <>
        <div className={cn('relative', className)}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] rounded-xl text-sm text-[#E6EDF3] transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>{wallet?.icon}</span>
            <span className="font-mono">{truncateAddress(address)}</span>
            <ChevronDown size={14} />
          </button>
          {showMenu && (
            <div className="absolute top-full right-0 mt-2 w-60 bg-[#161B22] border border-[#21262D] rounded-xl shadow-modal z-50 p-1">
              <div className="px-3 py-2.5 border-b border-[#21262D] mb-1">
                <div className="text-xs text-[#8B949E]">Connected with {wallet?.name}</div>
                <div className="text-sm font-mono mt-0.5">{truncateAddress(address, 10, 6)}</div>
                <Badge variant="success" size="sm" dot className="mt-1.5">Active session</Badge>
              </div>
              <button
                onClick={() => { copyToClipboard(address); toast.success('Address copied!'); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] rounded-lg"
              >
                <Copy size={14} /> Copy Address
              </button>
              <button
                onClick={() => { setShowMenu(false); setSignModal(true); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#8B949E] hover:text-amber-400 hover:bg-amber-500/10 rounded-lg"
              >
                <PenLine size={14} /> Sign Transaction
              </button>
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg"
              >
                <LogOut size={14} /> Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Transaction signing modal */}
        <Modal isOpen={signModal} onClose={() => !signing && setSignModal(false)} title="Sign Transaction" size="sm">
          <div className="p-6 space-y-4">
            {signed ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/15 flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-green-400" />
                </div>
                <div className="font-semibold text-lg">Transaction Signed!</div>
                <p className="text-sm text-[#8B949E]">Your transaction has been signed and broadcast to the network.</p>
              </div>
            ) : (
              <>
                <div className="rounded-xl bg-[#111318] border border-[#21262D] p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[#8B949E]">Action</span><span>Deposit to trading account</span></div>
                  <div className="flex justify-between"><span className="text-[#8B949E]">From</span><span className="font-mono text-xs">{truncateAddress(address)}</span></div>
                  <div className="flex justify-between"><span className="text-[#8B949E]">Network</span><span>Ethereum</span></div>
                  <div className="flex justify-between"><span className="text-[#8B949E]">Est. Gas</span><span>~$1.24</span></div>
                </div>
                <div className="flex items-start gap-2 text-xs text-[#8B949E] bg-[#111318] rounded-lg p-3 border border-[#21262D]">
                  <ShieldCheck size={14} className="text-green-400 shrink-0 mt-0.5" />
                  Review the details in your {wallet?.name} wallet and approve the signature request.
                </div>
                <Button fullWidth size="lg" isLoading={signing} onClick={handleSign}>
                  {signing ? 'Waiting for wallet approval…' : `Sign with ${wallet?.name}`}
                </Button>
              </>
            )}
          </div>
        </Modal>
      </>
    );
  }

  // ─── Disconnected state ─────────────────────────────────────────
  return (
    <>
      <Button variant="outline" leftIcon={<Wallet size={16} />} onClick={() => { setShowModal(true); setStep('choose'); }} className={className}>
        Connect Wallet
      </Button>

      <Modal
        isOpen={showModal}
        onClose={() => { if (step !== 'connecting' && step !== 'approving') { setShowModal(false); setStep('choose'); } }}
        title={step === 'connected' ? undefined : 'Connect Wallet'}
        size="sm"
        hideClose={step === 'connecting' || step === 'approving'}
      >
        <div className="p-4">
          {step === 'choose' && (
            <div className="space-y-2">
              <p className="text-xs text-[#8B949E] text-center pb-2">
                Choose your wallet to connect to Bridge Capital Exchange
              </p>
              {WALLETS.map((w) => (
                <button
                  key={w.id}
                  onClick={() => handleConnect(w.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-[#21262D] hover:border-amber-500/30 hover:bg-[#1C2128] transition-all"
                >
                  <span className="text-2xl">{w.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-[#E6EDF3]">{w.name}</div>
                    <div className="text-xs text-[#8B949E]">{w.description}</div>
                  </div>
                </button>
              ))}
              <p className="text-xs text-center text-[#6E7681] pt-2">
                By connecting, you agree to our Terms of Service
              </p>
            </div>
          )}

          {(step === 'connecting' || step === 'approving') && (
            <div className="py-10 text-center space-y-5">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-amber-500/20" />
                <div className="absolute inset-0 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-3xl">{wallet?.icon}</div>
              </div>
              <div>
                <div className="font-semibold">
                  {step === 'connecting' ? `Opening ${wallet?.name}…` : 'Awaiting approval'}
                </div>
                <p className="text-sm text-[#8B949E] mt-1">
                  {step === 'connecting'
                    ? 'Launching your wallet. If nothing happens, open it manually.'
                    : `Confirm the connection request in ${wallet?.name} to continue.`}
                </p>
              </div>
              <div className="flex items-center justify-center gap-6 text-xs">
                <span className={cn('flex items-center gap-1.5', 'text-green-400')}>
                  <CheckCircle2 size={13} /> Initialize
                </span>
                <span className={cn('flex items-center gap-1.5', step === 'approving' ? 'text-green-400' : 'text-amber-400')}>
                  {step === 'approving' ? <CheckCircle2 size={13} /> : <Loader2 size={13} className="animate-spin" />} Connect
                </span>
                <span className={cn('flex items-center gap-1.5', step === 'approving' ? 'text-amber-400' : 'text-[#6E7681]')}>
                  {step === 'approving' ? <Loader2 size={13} className="animate-spin" /> : null} Approve
                </span>
              </div>
            </div>
          )}

          {step === 'connected' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/15 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-green-400" />
              </div>
              <div>
                <div className="font-semibold text-lg">Wallet Connected!</div>
                <p className="text-sm text-[#8B949E] mt-1">
                  {wallet?.name} is now linked to your Bridge Capital account.
                </p>
              </div>
              <div className="mx-6 rounded-xl bg-[#111318] border border-[#21262D] p-3 font-mono text-xs break-all">
                {address}
              </div>
              <Button fullWidth size="lg" className="mx-auto max-w-[calc(100%-3rem)]" onClick={finishConnect}>
                Start Using Wallet
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
