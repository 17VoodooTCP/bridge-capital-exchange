'use client';
import React, { useState, useEffect } from 'react';
import { Wallet, ChevronDown, LogOut, Copy, CheckCircle2, ArrowDownLeft, ExternalLink, AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { truncateAddress, copyToClipboard, cn } from '@/lib/utils';
import { getInjectedProvider, connectInjected, sendEth, sendUsdt } from '@/lib/web3';
import { useWalletConfigStore } from '@/store/walletConfigStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const INJECTED_WALLETS = [
  { id: 'metamask', name: 'MetaMask', icon: '🦊', description: 'Browser extension' },
  { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵', description: 'Browser extension' },
  { id: 'trust', name: 'Trust Wallet', icon: '🛡️', description: 'Browser extension' },
  { id: 'brave', name: 'Brave Wallet', icon: '🦁', description: 'Built into Brave' },
];

export function WalletConnectButton({ className }: { className?: string }) {
  const [showModal, setShowModal] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [depositModal, setDepositModal] = useState(false);
  const [depositAsset, setDepositAsset] = useState<'ETH' | 'USDT'>('ETH');
  const [depositAmount, setDepositAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  const configs = useWalletConfigStore((s) => s.configs);
  const hasProvider = typeof window !== 'undefined' && !!getInjectedProvider();

  // React to account changes / disconnects from the wallet itself
  useEffect(() => {
    const provider = getInjectedProvider();
    if (!provider?.on) return;
    const onAccounts = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (!accounts?.length) {
        setAddress(null);
        toast('Wallet disconnected');
      } else {
        setAddress(accounts[0]);
      }
    };
    provider.on('accountsChanged', onAccounts);
    return () => provider.removeListener?.('accountsChanged', onAccounts);
  }, []);

  const handleConnect = async () => {
    if (!hasProvider) {
      window.open('https://metamask.io/download/', '_blank');
      return toast.error('No wallet extension detected — install MetaMask first.');
    }
    setConnecting(true);
    try {
      const account = await connectInjected(); // real wallet prompt
      setAddress(account);
      setShowModal(false);
      toast.success(`Wallet connected: ${truncateAddress(account)}`);
    } catch (err: unknown) {
      const code = (err as { code?: number }).code;
      toast.error(code === 4001 ? 'Connection request rejected in wallet.' : 'Could not connect wallet.');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setAddress(null);
    setShowMenu(false);
    toast.success('Wallet disconnected from Bridge Capital');
  };

  // Real on-chain deposit: transfers from the user's wallet to the
  // platform's admin-configured deposit address, then records it for review.
  const platformAddress = configs.find(
    (c) => c.active && c.network === 'ERC20' && c.asset === (depositAsset === 'ETH' ? 'ETH' : 'USDT')
  )?.address;

  const handleDeposit = async () => {
    if (!address) return;
    const amt = depositAmount.trim();
    if (!amt || Number(amt) <= 0) return toast.error('Enter a valid amount');
    if (!platformAddress) return toast.error(`No ${depositAsset} (ERC20) deposit address configured. Contact support.`);

    setSending(true);
    try {
      const txHash = depositAsset === 'ETH'
        ? await sendEth(address, platformAddress, amt)
        : await sendUsdt(address, platformAddress, amt);

      setLastTxHash(txHash);
      // Record the pending deposit so it shows in history + admin review
      await api.post('/wallet/deposit', {
        asset: depositAsset,
        amount: Number(amt),
        network: 'ERC20',
        txHash,
      }).catch(() => {});
      toast.success('Transaction submitted! It will be credited after network confirmation.');
      setDepositAmount('');
    } catch (err: unknown) {
      const code = (err as { code?: number }).code;
      toast.error(code === 4001 ? 'Transaction rejected in wallet.' : 'Transaction failed — check your wallet balance and gas.');
    } finally {
      setSending(false);
    }
  };

  // ─── Connected ───────────────────────────────────────────────────
  if (address) {
    return (
      <>
        <div className={cn('relative', className)}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] rounded-xl text-sm text-[#E6EDF3] transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono">{truncateAddress(address)}</span>
            <ChevronDown size={14} />
          </button>
          {showMenu && (
            <div className="absolute top-full right-0 mt-2 w-60 bg-[#161B22] border border-[#21262D] rounded-xl shadow-modal z-50 p-1">
              <div className="px-3 py-2.5 border-b border-[#21262D] mb-1">
                <div className="text-xs text-[#8B949E]">Connected wallet</div>
                <div className="text-sm font-mono mt-0.5">{truncateAddress(address, 10, 6)}</div>
                <Badge variant="success" size="sm" dot className="mt-1.5">Live on Ethereum</Badge>
              </div>
              <button
                onClick={() => { copyToClipboard(address); toast.success('Address copied!'); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] rounded-lg"
              >
                <Copy size={14} /> Copy Address
              </button>
              <button
                onClick={() => { setShowMenu(false); setDepositModal(true); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#8B949E] hover:text-amber-400 hover:bg-amber-500/10 rounded-lg"
              >
                <ArrowDownLeft size={14} /> Deposit to Exchange
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

        {/* Real on-chain deposit modal */}
        <Modal isOpen={depositModal} onClose={() => !sending && setDepositModal(false)} title="Deposit from Wallet" size="sm">
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {(['ETH', 'USDT'] as const).map((a) => (
                <button key={a} onClick={() => setDepositAsset(a)}
                  className={cn('py-2.5 rounded-xl border text-sm transition-all',
                    depositAsset === a ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-[#21262D] text-[#8B949E]')}>
                  {a} <span className="text-xs opacity-60">(ERC20)</span>
                </button>
              ))}
            </div>
            <Input label={`Amount (${depositAsset})`} type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="0.00" />
            <div className="text-xs text-[#8B949E] bg-[#111318] border border-[#21262D] rounded-lg p-3 space-y-1">
              <div className="flex justify-between"><span>From</span><span className="font-mono">{truncateAddress(address)}</span></div>
              <div className="flex justify-between"><span>To (platform)</span><span className="font-mono">{platformAddress ? truncateAddress(platformAddress) : 'Not configured'}</span></div>
              <div className="flex justify-between"><span>Network</span><span>Ethereum Mainnet</span></div>
            </div>
            <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <AlertTriangle size={13} className="shrink-0 mt-0.5" />
              This sends a real on-chain transaction. Your wallet will show the exact amount and gas before you approve.
            </div>
            {lastTxHash && (
              <a href={`https://etherscan.io/tx/${lastTxHash}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-green-400 hover:underline">
                <CheckCircle2 size={13} /> View last transaction on Etherscan <ExternalLink size={11} />
              </a>
            )}
            <Button fullWidth size="lg" isLoading={sending} onClick={handleDeposit}>
              {sending ? 'Confirm in your wallet…' : `Send ${depositAsset}`}
            </Button>
          </div>
        </Modal>
      </>
    );
  }

  // ─── Disconnected ────────────────────────────────────────────────
  return (
    <>
      <Button variant="outline" leftIcon={<Wallet size={16} />} onClick={() => setShowModal(true)} className={className}>
        Connect Wallet
      </Button>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Connect Wallet" size="sm">
        <div className="p-4 space-y-2">
          {!hasProvider && (
            <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              No wallet extension detected in this browser. Install MetaMask (or use a wallet browser) to connect.
            </div>
          )}
          <p className="text-xs text-[#8B949E] text-center pb-2">
            Connect a browser-extension wallet to Bridge Capital Exchange
          </p>
          {INJECTED_WALLETS.map((w) => (
            <button
              key={w.id}
              onClick={handleConnect}
              disabled={connecting}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-[#21262D] hover:border-amber-500/30 hover:bg-[#1C2128] transition-all disabled:opacity-50"
            >
              <span className="text-2xl">{w.icon}</span>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-[#E6EDF3]">{w.name}</div>
                <div className="text-xs text-[#8B949E]">{w.description}</div>
              </div>
              {connecting && <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />}
            </button>
          ))}
          <p className="text-xs text-center text-[#6E7681] pt-2">
            Mobile wallets via QR (WalletConnect) coming soon. By connecting, you agree to our Terms of Service.
          </p>
        </div>
      </Modal>
    </>
  );
}
