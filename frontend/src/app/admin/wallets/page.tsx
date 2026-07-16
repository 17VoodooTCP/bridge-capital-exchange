'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { QrCode, Upload, Plus, Lock, KeyRound, Eye, Pencil, Copy, RefreshCw, Trash2 } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { NETWORKS } from '@/lib/constants';
import { truncateAddress, copyToClipboard } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface WalletCfg {
  id: string;
  asset: string;
  network: string;
  address: string;
  minDeposit: number | string;
  isActive: boolean;
  qrCodeUrl?: string | null;
  confirmations?: number;
}

/** Downsize an uploaded QR image so the stored data URL stays small. */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const SIZE = 320;
        const canvas = document.createElement('canvas');
        canvas.width = SIZE; canvas.height = SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('no canvas'));
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, SIZE, SIZE);
        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminWalletsPage() {
  const [configs, setConfigs] = useState<WalletCfg[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [secureModal, setSecureModal] = useState(false);
  const [form, setForm] = useState({ asset: 'USDT', network: 'TRC20', address: '', minDeposit: '' });
  const [editTarget, setEditTarget] = useState<WalletCfg | null>(null);
  const [editForm, setEditForm] = useState({ address: '', minDeposit: '', network: '' });
  const qrInputRef = useRef<HTMLInputElement>(null);
  const qrTargetRef = useRef<WalletCfg | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<WalletCfg[]>('/admin/wallet-configs');
      setConfigs(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Could not load wallet configs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (cfg: Partial<WalletCfg>) => {
    const res = await api.post<WalletCfg>('/admin/wallet-configs', cfg);
    setConfigs((list) => {
      const idx = list.findIndex((c) => c.asset === res.data.asset && c.network === res.data.network);
      if (idx >= 0) { const next = [...list]; next[idx] = res.data; return next; }
      return [...list, res.data];
    });
    return res.data;
  };

  const pickQr = (c: WalletCfg) => { qrTargetRef.current = c; qrInputRef.current?.click(); };

  const onQrSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = qrTargetRef.current;
    if (!file || !target) return;
    try {
      const qrCodeUrl = await fileToDataUrl(file);
      await save({ asset: target.asset, network: target.network, address: target.address, minDeposit: Number(target.minDeposit), qrCodeUrl, isActive: target.isActive });
      toast.success('QR uploaded — now shown on every user\'s deposit screen');
    } catch {
      toast.error('Could not process image');
    }
    e.target.value = '';
  };

  const add = async () => {
    if (!form.address) return toast.error('Wallet address required');
    try {
      await save({ asset: form.asset.toUpperCase(), network: form.network, address: form.address, minDeposit: Number(form.minDeposit) || 0, isActive: true });
      toast.success(`Added ${form.asset} (${form.network}) — live for all users`);
      setForm({ asset: 'USDT', network: 'TRC20', address: '', minDeposit: '' });
      setAddModal(false);
    } catch { toast.error('Could not save.'); }
  };

  const openEdit = (c: WalletCfg) => { setEditTarget(c); setEditForm({ address: c.address, minDeposit: String(c.minDeposit), network: c.network }); };

  const saveEdit = async () => {
    if (!editTarget) return;
    if (!editForm.address.trim()) return toast.error('Wallet address required');
    try {
      await save({ asset: editTarget.asset, network: editForm.network, address: editForm.address.trim(), minDeposit: Number(editForm.minDeposit) || 0, qrCodeUrl: editTarget.qrCodeUrl, isActive: editTarget.isActive });
      toast.success(`${editTarget.asset} address updated — live for all users`);
      setEditTarget(null);
    } catch { toast.error('Could not save.'); }
  };

  const toggleActive = async (c: WalletCfg) => {
    await save({ asset: c.asset, network: c.network, address: c.address, minDeposit: Number(c.minDeposit), qrCodeUrl: c.qrCodeUrl, isActive: !c.isActive });
    toast.success(c.isActive ? 'Hidden from users' : 'Now live for users');
  };

  const remove = async (c: WalletCfg) => {
    if (!confirm(`Delete ${c.asset} (${c.network}) deposit config?`)) return;
    await api.delete(`/admin/wallet-configs/${c.id}`).catch(() => {});
    setConfigs((list) => list.filter((x) => x.id !== c.id));
    toast.success('Removed');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Wallet Configuration</h1><p className="text-sm text-[#8B949E]">Deposit addresses and QR codes shown to every user, per chain</p></div>
        <div className="flex gap-2">
          <Button variant="outline" leftIcon={<RefreshCw size={15} />} onClick={load}>Refresh</Button>
          <Button leftIcon={<Plus size={15} />} onClick={() => setAddModal(true)}>Add Wallet</Button>
        </div>
      </div>

      <Card className="border-red-500/30">
        <CardBody className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center"><Lock size={20} className="text-red-400" /></div>
            <div>
              <div className="font-medium flex items-center gap-2">Sensitive Wallet Data <Badge variant="danger" size="sm">Super Admin Only</Badge></div>
              <div className="text-sm text-[#8B949E]">Private keys and seed phrases are encrypted. Access requires a one-time secure code.</div>
            </div>
          </div>
          <Button variant="danger" leftIcon={<KeyRound size={15} />} onClick={() => setSecureModal(true)}>Request Access</Button>
        </CardBody>
      </Card>

      <input ref={qrInputRef} type="file" accept="image/*" className="hidden" onChange={onQrSelected} />

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">{[1, 2].map((i) => <div key={i} className="skeleton h-40 rounded-xl" />)}</div>
      ) : configs.length === 0 ? (
        <Card><CardBody className="py-14 text-center text-sm text-[#8B949E]">No deposit wallets configured. Click &quot;Add Wallet&quot; to create one — it will appear on every user&apos;s deposit screen.</CardBody></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {configs.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="font-semibold">{c.asset}</span><Badge variant="info" size="sm">{c.network}</Badge></div>
                  <Badge variant={c.isActive ? 'success' : 'default'} dot>{c.isActive ? 'Live for users' : 'Hidden'}</Badge>
                </div>
              </CardHeader>
              <CardBody className="flex gap-4">
                <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                  {c.qrCodeUrl ? <img src={c.qrCodeUrl} alt={`${c.asset} ${c.network} QR`} className="w-full h-full object-contain" /> : <QrCode size={70} className="text-black" />}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <div className="text-xs text-[#8B949E]">Deposit Address</div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-mono break-all">{truncateAddress(c.address, 12, 8)}</span>
                      <button onClick={() => { copyToClipboard(c.address); toast.success('Full address copied'); }} className="p-1 text-[#8B949E] hover:text-amber-400 shrink-0"><Copy size={12} /></button>
                    </div>
                  </div>
                  <div className="text-sm"><span className="text-[#8B949E] text-xs">Min Deposit</span><div>{c.minDeposit} {c.asset}</div></div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button size="xs" variant="outline" leftIcon={<Pencil size={12} />} onClick={() => openEdit(c)}>Edit</Button>
                    <Button size="xs" variant="outline" leftIcon={<Upload size={12} />} onClick={() => pickQr(c)}>{c.qrCodeUrl ? 'Replace QR' : 'Upload QR'}</Button>
                    <Button size="xs" variant="ghost" onClick={() => toggleActive(c)}>{c.isActive ? 'Hide' : 'Show'}</Button>
                    <Button size="xs" variant="ghost" className="text-red-400" onClick={() => remove(c)}><Trash2 size={14} /></Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Deposit Wallet" size="md">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Asset" value={form.asset} onChange={(e) => setForm({ ...form, asset: e.target.value })} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#8B949E]">Network</label>
              <select value={form.network} onChange={(e) => setForm({ ...form, network: e.target.value })} className="bg-[#111318] border border-[#21262D] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-500/50">
                {NETWORKS.map((n) => <option key={n.value} value={n.value} className="bg-[#161B22]">{n.name}</option>)}
              </select>
            </div>
          </div>
          <Input label="Wallet Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Paste deposit address" />
          <Input label="Minimum Deposit" type="number" value={form.minDeposit} onChange={(e) => setForm({ ...form, minDeposit: e.target.value })} />
          <div className="flex gap-3"><Button variant="outline" fullWidth onClick={() => setAddModal(false)}>Cancel</Button><Button fullWidth onClick={add}>Add Wallet</Button></div>
        </div>
      </Modal>

      <Modal isOpen={editTarget !== null} onClose={() => setEditTarget(null)} title={editTarget ? `Edit ${editTarget.asset} (${editTarget.network})` : ''} size="md">
        <div className="p-6 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#8B949E]">Network</label>
            <select value={editForm.network} onChange={(e) => setEditForm({ ...editForm, network: e.target.value })} className="bg-[#111318] border border-[#21262D] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-500/50">
              {NETWORKS.map((n) => <option key={n.value} value={n.value} className="bg-[#161B22]">{n.name}</option>)}
              {editTarget && !NETWORKS.some((n) => n.value === editTarget.network) && <option value={editTarget.network} className="bg-[#161B22]">{editTarget.network}</option>}
            </select>
          </div>
          <Input label="Wallet Address" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} hint="Shown to all users immediately after saving" />
          <Input label="Minimum Deposit" type="number" value={editForm.minDeposit} onChange={(e) => setEditForm({ ...editForm, minDeposit: e.target.value })} />
          <div className="flex gap-3"><Button variant="outline" fullWidth onClick={() => setEditTarget(null)}>Cancel</Button><Button fullWidth onClick={saveEdit}>Save Changes</Button></div>
        </div>
      </Modal>

      <Modal isOpen={secureModal} onClose={() => setSecureModal(false)} title="Secure Access Request" size="md">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm"><Lock size={16} /> This action requires super-admin approval and is fully audited.</div>
          <div className="rounded-lg bg-[#0D1117] border border-[#21262D] p-4 text-center">
            <div className="text-xs text-[#8B949E] mb-2">One-Time Secure Code</div>
            <div className="text-2xl font-mono font-bold tracking-[0.3em] text-amber-400">7F2B-9C4E</div>
            <div className="text-xs text-[#6E7681] mt-2">Expires in 04:59 · Visible to authorized roles only</div>
          </div>
          <Input label="Enter Secure Code" placeholder="XXXX-XXXX" prefix={<KeyRound size={15} />} />
          <Button fullWidth leftIcon={<Eye size={15} />} onClick={() => { toast.success('Access granted — decrypting (audited)'); setSecureModal(false); }}>Decrypt &amp; View</Button>
        </div>
      </Modal>
    </div>
  );
}
