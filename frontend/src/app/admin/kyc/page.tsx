'use client';
import { useState } from 'react';
import { Card, CardBody, StatCard } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KYCReviewModal } from '@/components/admin/KYCReviewModal';
import { mockAdminUsers } from '@/lib/mockData';
import { formatDate, getInitials } from '@/lib/utils';

export default function AdminKYCPage() {
  const [tab, setTab] = useState('PENDING');
  const [review, setReview] = useState<{ open: boolean; name?: string }>({ open: false });

  const byStatus = (s: string) => mockAdminUsers.filter((u) => s === 'PENDING' ? u.kycStatus === 'PENDING' || u.kycStatus === 'NONE' : u.kycStatus === s);
  const list = byStatus(tab);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">KYC Review</h1><p className="text-sm text-[#8B949E]">Verify user identities and documents</p></div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Pending Review" value={byStatus('PENDING').length} subValue="Action needed" subValueColor="text-amber-400" />
        <StatCard label="Approved" value={byStatus('APPROVED').length} subValueColor="text-green-400" />
        <StatCard label="Rejected" value={byStatus('REJECTED').length} subValueColor="text-red-400" />
      </div>

      <Tabs tabs={[{ id: 'PENDING', label: 'Pending', count: byStatus('PENDING').length }, { id: 'APPROVED', label: 'Approved' }, { id: 'REJECTED', label: 'Rejected' }]} activeTab={tab} onChange={setTab} variant="underline" />

      <Card>
        <CardBody className="p-0">
          {list.length === 0 ? <div className="py-12 text-center text-sm text-[#8B949E]">No applications in this category</div> : list.map((u) => (
            <div key={u.id} className="flex items-center gap-4 px-5 py-4 border-b border-[#21262D]/50 last:border-0 hover:bg-[#1C2128] transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-black">{getInitials(u.name)}</div>
              <div className="flex-1">
                <div className="font-medium">{u.name}</div>
                <div className="text-xs text-[#8B949E]">{u.email} · {u.country} · Submitted {formatDate(u.createdAt, 'relative')}</div>
              </div>
              <Badge variant={u.kycStatus === 'APPROVED' ? 'success' : u.kycStatus === 'REJECTED' ? 'danger' : 'warning'}>{u.kycStatus}</Badge>
              <Button size="sm" onClick={() => setReview({ open: true, name: u.name })}>Review</Button>
            </div>
          ))}
        </CardBody>
      </Card>

      <KYCReviewModal isOpen={review.open} onClose={() => setReview({ open: false })} userName={review.name} />
    </div>
  );
}
