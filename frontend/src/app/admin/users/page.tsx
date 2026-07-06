'use client';
import { useState } from 'react';
import { Search, Plus, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { UserTable } from '@/components/admin/UserTable';
import { FundAdjustmentModal } from '@/components/admin/FundAdjustmentModal';
import { mockAdminUsers } from '@/lib/mockData';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState(mockAdminUsers);
  const [query, setQuery] = useState('');
  const [fundModal, setFundModal] = useState<{ open: boolean; user?: typeof mockAdminUsers[0] }>({ open: false });
  const [createModal, setCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', country: 'US' });

  const filtered = users.filter((u) => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()));

  const toggleHold = (u: typeof mockAdminUsers[0]) => {
    setUsers((list) => list.map((x) => x.id === u.id ? { ...x, isHeld: !x.isHeld } : x));
    toast.success(`${u.isHeld ? 'Released hold on' : 'Placed hold on'} ${u.name}. Action logged.`);
  };

  const createUser = () => {
    if (!newUser.name || !newUser.email) return toast.error('Name and email required');
    setUsers((list) => [{ id: `user-${Date.now()}`, name: newUser.name, email: newUser.email, role: 'USER', kycStatus: 'NONE', isHeld: false, totalBalance: 0, country: newUser.country, createdAt: new Date().toISOString() }, ...list]);
    toast.success(`Account created for ${newUser.name}`);
    setNewUser({ name: '', email: '', country: 'US' });
    setCreateModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">User Management</h1><p className="text-sm text-[#8B949E]">{users.length} total users</p></div>
        <div className="flex gap-2">
          <Button variant="outline" leftIcon={<Download size={15} />} onClick={() => toast.success('Exporting user data...')}>Export</Button>
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
        <UserTable users={filtered} onAdjust={(u) => setFundModal({ open: true, user: u })} onToggleHold={toggleHold} onView={(u) => toast(`Viewing ${u.name}`)} />
      </Card>

      <FundAdjustmentModal isOpen={fundModal.open} onClose={() => setFundModal({ open: false })} userName={fundModal.user?.name} currentBalance={fundModal.user?.totalBalance} />

      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create User Account" size="md">
        <div className="p-6 space-y-4">
          <Input label="Full Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="Jane Doe" />
          <Input label="Email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="jane@example.com" />
          <Input label="Country Code" value={newUser.country} onChange={(e) => setNewUser({ ...newUser, country: e.target.value })} />
          <div className="flex gap-3"><Button variant="outline" fullWidth onClick={() => setCreateModal(false)}>Cancel</Button><Button fullWidth onClick={createUser}>Create Account</Button></div>
        </div>
      </Modal>
    </div>
  );
}
