'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { UserTable } from '@/components/admin/UserTable';
import { FundAdjustmentModal } from '@/components/admin/FundAdjustmentModal';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  kycStatus: string;
  isHeld: boolean;
  totalBalance: number;
  country: string;
  createdAt: string;
  [key: string]: unknown;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [fundModal, setFundModal] = useState<{ open: boolean; user?: AdminUser }>({ open: false });
  const [createModal, setCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', country: 'US' });

  const load = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', { params: q ? { q } : undefined });
      const list = Array.isArray(res.data) ? res.data : [];
      setUsers(list.map((u: Record<string, unknown>) => ({ ...u, totalBalance: 0, country: u.country || '—' })) as AdminUser[]);
    } catch {
      toast.error('Could not load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())
  );

  const toggleHold = async (u: AdminUser) => {
    try {
      await api.patch(`/admin/users/${u.id}/hold`, { reason: u.isHeld ? undefined : 'Manual admin hold' });
      setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, isHeld: !x.isHeld } : x)));
      toast.success(`${u.isHeld ? 'Released hold on' : 'Placed hold on'} ${u.name}. Action logged.`);
    } catch {
      toast.error('Action failed.');
    }
  };

  const createUser = async () => {
    if (!newUser.name || !newUser.email) return toast.error('Name and email required');
    if (newUser.password.length < 8) return toast.error('Password must be at least 8 characters');
    try {
      const res = await api.post('/admin/users', newUser);
      setUsers((list) => [{ ...res.data, totalBalance: 0, country: res.data.country || '—' }, ...list]);
      toast.success(`Account created for ${newUser.name}`);
      setNewUser({ name: '', email: '', password: '', country: 'US' });
      setCreateModal(false);
    } catch {
      toast.error('Could not create user — email may already exist.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">User Management</h1><p className="text-sm text-[#8B949E]">{users.length} registered users</p></div>
        <div className="flex gap-2">
          <Button variant="outline" leftIcon={<RefreshCw size={15} />} onClick={() => load()}>Refresh</Button>
          <Button leftIcon={<Plus size={15} />} onClick={() => setCreateModal(true)}>Create User</Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-[#21262D]">
          <div className="flex items-center gap-2 bg-[#111318] border border-[#21262D] rounded-lg px-3 py-2 max-w-md">
            <Search size={14} className="text-[#8B949E]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email..." className="flex-1 bg-transparent text-sm outline-none text-[#E6EDF3]" />
          </div>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center text-sm text-[#8B949E]">No users found.</div>
        ) : (
          <UserTable users={filtered} onAdjust={(u) => setFundModal({ open: true, user: u as AdminUser })} onToggleHold={(u) => toggleHold(u as AdminUser)} onView={(u) => toast(`${u.name} · ${u.email}`)} />
        )}
      </Card>

      <FundAdjustmentModal isOpen={fundModal.open} onClose={() => setFundModal({ open: false })} userName={fundModal.user?.name} userId={fundModal.user?.id} currentBalance={fundModal.user?.totalBalance} />

      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create User Account" size="md">
        <div className="p-6 space-y-4">
          <Input label="Full Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="Jane Doe" />
          <Input label="Email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="jane@example.com" />
          <Input label="Temporary Password" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="8+ characters" />
          <Input label="Country Code" value={newUser.country} onChange={(e) => setNewUser({ ...newUser, country: e.target.value })} />
          <div className="flex gap-3"><Button variant="outline" fullWidth onClick={() => setCreateModal(false)}>Cancel</Button><Button fullWidth onClick={createUser}>Create Account</Button></div>
        </div>
      </Modal>
    </div>
  );
}
