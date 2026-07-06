'use client';
import { useState } from 'react';
import { FileText, Check, X, User } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export function KYCReviewModal({ isOpen, onClose, userName = 'Applicant' }: Props) {
  const [note, setNote] = useState('');

  const act = (approved: boolean) => {
    if (!approved && !note.trim()) return toast.error('Add a reason when rejecting');
    toast.success(`KYC ${approved ? 'approved' : 'rejected'} for ${userName}. User notified.`);
    setNote('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`KYC Review — ${userName}`} size="xl">
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111318] border border-[#21262D]">
          <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center"><User size={20} className="text-amber-400" /></div>
          <div className="flex-1">
            <div className="font-medium">{userName}</div>
            <div className="text-xs text-[#8B949E]">Submitted 2 days ago · ID Verification</div>
          </div>
          <Badge variant="warning" dot>Pending Review</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {['Passport (Front)', 'Proof of Address'].map((doc) => (
            <div key={doc} className="rounded-lg border border-[#21262D] overflow-hidden">
              <div className="aspect-[4/3] bg-[#0D1117] flex items-center justify-center">
                <div className="text-center text-[#6E7681]">
                  <FileText size={32} className="mx-auto mb-2" />
                  <span className="text-xs">Document Preview</span>
                </div>
              </div>
              <div className="px-3 py-2 flex items-center justify-between border-t border-[#21262D]">
                <span className="text-sm">{doc}</span>
                <button className="text-xs text-amber-400 hover:text-amber-300">Download</button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1"><span className="text-[#8B949E]">Full Name</span><div>{userName}</div></div>
          <div className="space-y-1"><span className="text-[#8B949E]">Date of Birth</span><div>1990-05-14</div></div>
          <div className="space-y-1"><span className="text-[#8B949E]">Country</span><div>United States</div></div>
          <div className="space-y-1"><span className="text-[#8B949E]">Document #</span><div>P1234567</div></div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#8B949E]">Review Note</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Optional for approval, required for rejection..." className="bg-[#111318] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#E6EDF3] outline-none focus:border-amber-500/50 resize-none" />
        </div>

        <div className="flex gap-3">
          <Button variant="danger" fullWidth leftIcon={<X size={16} />} onClick={() => act(false)}>Reject</Button>
          <Button variant="success" fullWidth leftIcon={<Check size={16} />} onClick={() => act(true)}>Approve</Button>
        </div>
      </div>
    </Modal>
  );
}
