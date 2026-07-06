'use client';
import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, FileText, Check, X } from 'lucide-react';
import { Card, CardBody, StatCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import api from '@/lib/api';
import { formatDate, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

interface KycDoc {
  id: string;
  type: string;
  fileUrl: string;
  status: string;
  uploadedAt: string;
  user: { id: string; name: string; email: string; country?: string };
}

const DOC_LABELS: Record<string, string> = {
  PASSPORT: 'Passport',
  DRIVERS_LICENSE: "Driver's License",
  NATIONAL_ID: 'National ID',
  PROOF_OF_ADDRESS: 'Proof of Address',
};

export default function AdminKYCPage() {
  const [docs, setDocs] = useState<KycDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState<KycDoc | null>(null);
  const [note, setNote] = useState('');
  const [deciding, setDeciding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/kyc/pending');
      setDocs(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Could not load KYC submissions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const decide = async (approved: boolean) => {
    if (!review) return;
    if (!approved && !note.trim()) return toast.error('Add a reason when rejecting');
    setDeciding(true);
    try {
      await api.patch(`/kyc/${review.id}/review`, { decision: approved ? 'APPROVED' : 'REJECTED', note: note || undefined });
      setDocs((list) => list.filter((d) => d.id !== review.id));
      toast.success(`KYC ${approved ? 'approved' : 'rejected'} for ${review.user.name}. User status updated.`);
      setReview(null);
      setNote('');
    } catch {
      toast.error('Review failed.');
    } finally {
      setDeciding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">KYC Review</h1><p className="text-sm text-[#8B949E]">Verify user identity documents</p></div>
        <Button variant="outline" leftIcon={<RefreshCw size={15} />} onClick={load}>Refresh</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md">
        <StatCard label="Pending Review" value={docs.length} subValue={docs.length > 0 ? 'Action needed' : 'All clear'} subValueColor={docs.length > 0 ? 'text-amber-400' : 'text-green-400'} />
        <StatCard label="Avg. Review Time" value="< 24h" />
      </div>

      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-5 space-y-3">{[1, 2].map((i) => <div key={i} className="skeleton h-14 rounded-lg" />)}</div>
          ) : docs.length === 0 ? (
            <div className="py-16 text-center text-sm text-[#8B949E]">No pending KYC submissions. New document uploads will appear here.</div>
          ) : (
            docs.map((d) => (
              <div key={d.id} className="flex items-center gap-4 px-5 py-4 border-b border-[#21262D]/50 last:border-0 hover:bg-[#1C2128] transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-black">{getInitials(d.user.name)}</div>
                <div className="flex-1">
                  <div className="font-medium">{d.user.name}</div>
                  <div className="text-xs text-[#8B949E]">{d.user.email} · Submitted {formatDate(d.uploadedAt, 'relative')}</div>
                </div>
                <Badge variant="info" size="sm">{DOC_LABELS[d.type] || d.type}</Badge>
                <Badge variant="warning" dot>PENDING</Badge>
                <Button size="sm" onClick={() => setReview(d)}>Review</Button>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      <Modal isOpen={review !== null} onClose={() => setReview(null)} title={review ? `KYC Review — ${review.user.name}` : ''} size="lg">
        {review && (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1"><span className="text-[#8B949E]">Applicant</span><div>{review.user.name}</div></div>
              <div className="space-y-1"><span className="text-[#8B949E]">Email</span><div>{review.user.email}</div></div>
              <div className="space-y-1"><span className="text-[#8B949E]">Document Type</span><div>{DOC_LABELS[review.type] || review.type}</div></div>
              <div className="space-y-1"><span className="text-[#8B949E]">Submitted</span><div>{formatDate(review.uploadedAt, 'full')}</div></div>
            </div>

            <div className="rounded-lg border border-[#21262D] p-4 flex items-center gap-3 bg-[#0D1117]">
              <FileText size={24} className="text-amber-400" />
              <div className="flex-1">
                <div className="text-sm font-medium">{review.fileUrl}</div>
                <div className="text-xs text-[#8B949E]">Uploaded document</div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#8B949E]">Review Note</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Optional for approval, required for rejection..." className="bg-[#111318] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#E6EDF3] outline-none focus:border-amber-500/50 resize-none" />
            </div>

            <div className="flex gap-3">
              <Button variant="danger" fullWidth isLoading={deciding} leftIcon={<X size={16} />} onClick={() => decide(false)}>Reject</Button>
              <Button variant="success" fullWidth isLoading={deciding} leftIcon={<Check size={16} />} onClick={() => decide(true)}>Approve</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
