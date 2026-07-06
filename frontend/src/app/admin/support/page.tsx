'use client';
import { useState, useRef } from 'react';
import { Send, Paperclip, Download, FileText } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockTickets, mockChatMessages } from '@/lib/mockData';
import { STATUS_COLORS } from '@/lib/constants';
import { formatDate, getInitials, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { ChatMessage } from '@/types';

export default function AdminSupportPage() {
  const [active, setActive] = useState(mockTickets[0].id);
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [input, setInput] = useState('');
  const [takenOver, setTakenOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const ticket = mockTickets.find((t) => t.id === active);

  const send = () => {
    if (!input.trim()) return;
    setMessages((m) => [...m, { id: `m-${Date.now()}`, ticketId: active, senderId: 'admin-001', senderName: 'Admin', senderRole: 'ADMIN', content: input, createdAt: new Date().toISOString(), isRead: true }]);
    setInput('');
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Support Console</h1><p className="text-sm text-[#8B949E]">Manage live chats and tickets</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><h3 className="font-semibold">Conversations</h3></CardHeader>
          <CardBody className="p-0">
            {mockTickets.map((t) => (
              <button key={t.id} onClick={() => setActive(t.id)} className={cn('w-full flex items-start gap-3 px-4 py-3 border-b border-[#21262D]/50 text-left hover:bg-[#1C2128] transition-colors', active === t.id && 'bg-amber-500/5')}>
                <div className="w-8 h-8 rounded-full bg-[#21262D] flex items-center justify-center text-xs shrink-0">{getInitials(t.userName)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{t.userName}</div>
                  <div className="text-xs text-[#8B949E] truncate">{t.subject}</div>
                </div>
                <span className={cn('text-xs px-2 py-0.5 rounded-full shrink-0', STATUS_COLORS[t.status])}>{t.status.replace('_', ' ')}</span>
              </button>
            ))}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div><div className="font-semibold">{ticket?.userName}</div><div className="text-xs text-[#8B949E]">{ticket?.subject} · {ticket?.userEmail}</div></div>
              <Button size="sm" variant={takenOver ? 'success' : 'default'} onClick={() => { setTakenOver(true); toast.success('You have taken over this chat'); }}>{takenOver ? 'You are handling this' : 'Take Over'}</Button>
            </div>
          </CardHeader>
          <CardBody className="flex-1 space-y-4 max-h-[400px] overflow-y-auto">
            {messages.map((m) => {
              const isStaff = m.senderRole === 'ADMIN' || m.senderRole === 'SUPPORT';
              return (
                <div key={m.id} className={cn('flex flex-col max-w-[80%]', isStaff ? 'ml-auto items-end' : 'items-start')}>
                  <span className="text-xs text-[#8B949E] mb-1">{m.senderName} · {formatDate(m.createdAt, 'time')}</span>
                  <div className={cn('px-3.5 py-2.5 rounded-2xl text-sm', isStaff ? 'bg-amber-500 text-black' : 'bg-[#21262D] text-[#E6EDF3]')}>
                    {m.content}
                    {m.fileUrl && <div className="flex items-center gap-2 mt-2 text-xs underline"><FileText size={12} /> {m.fileUrl} <Download size={12} /></div>}
                  </div>
                </div>
              );
            })}
          </CardBody>
          <div className="p-3 border-t border-[#21262D] flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setMessages((m) => [...m, { id: `m-${Date.now()}`, ticketId: active, senderId: 'admin-001', senderName: 'Admin', senderRole: 'ADMIN', content: 'Sent an attachment', fileUrl: f.name, createdAt: new Date().toISOString(), isRead: true }]);
                  toast.success(`Attached ${f.name}`);
                }
                e.target.value = '';
              }}
            />
            <button className="p-2 text-[#8B949E] hover:text-amber-400" onClick={() => fileRef.current?.click()}><Paperclip size={18} /></button>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Type a reply..." className="flex-1 bg-[#111318] border border-[#21262D] rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500/50" />
            <Button size="md" onClick={send} className="!px-3"><Send size={16} /></Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
