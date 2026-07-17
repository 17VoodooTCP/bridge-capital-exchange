'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, Download, FileText, RefreshCw } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { STATUS_COLORS } from '@/lib/constants';
import { formatDate, getInitials, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Ticket {
  id: string;
  subject: string;
  status: string;
  user?: { name: string; email: string };
}
interface Msg {
  id: string;
  senderId: string;
  content: string;
  fileUrl?: string | null;
  createdAt: string;
  sender?: { name: string; role: string };
}

const isImage = (url?: string | null) => !!url && url.startsWith('data:image');
const fileName = (url?: string | null) => {
  if (!url) return 'attachment';
  const m = url.match(/name=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : 'attachment';
};

export default function AdminSupportPage() {
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState<{ dataUrl: string; name: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const lastTypingSent = useRef(0);

  const pingTyping = () => {
    if (!active) return;
    const now = Date.now();
    if (now - lastTypingSent.current < 1800) return;
    lastTypingSent.current = now;
    api.post(`/support/tickets/${active}/typing`).catch(() => {});
  };

  const loadTickets = useCallback(async () => {
    const r = await api.get<Ticket[]>('/support/tickets').catch(() => null);
    if (r && Array.isArray(r.data)) {
      setTickets(r.data);
      setActive((cur) => cur ?? r.data[0]?.id ?? null);
    }
  }, []);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  // Poll the active conversation's messages in real time
  useEffect(() => {
    if (!active) return;
    let alive = true;
    const poll = async () => {
      const r = await api.get<Msg[]>(`/support/tickets/${active}/messages`).catch(() => null);
      if (alive && r && Array.isArray(r.data)) setMessages(r.data);
      const ty = await api.get<{ typing: boolean }>(`/support/tickets/${active}/typing`).catch(() => null);
      if (alive && ty) setOtherTyping(!!ty.data?.typing);
    };
    poll();
    const t = setInterval(poll, 2500);
    return () => { alive = false; clearInterval(t); };
  }, [active]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, otherTyping]);

  const ticket = tickets.find((t) => t.id === active);

  const send = async () => {
    if ((!input.trim() && !attachment) || !active) return;
    setSending(true);
    try {
      const fileUrl = attachment
        ? isImage(attachment.dataUrl) ? attachment.dataUrl : `${attachment.dataUrl}#name=${encodeURIComponent(attachment.name)}`
        : undefined;
      const res = await api.post<Msg>(`/support/tickets/${active}/messages`, { content: input || (attachment ? `📎 ${attachment.name}` : ''), fileUrl });
      if (res?.data?.id) setMessages((m) => (m.some((x) => x.id === res.data.id) ? m : [...m, res.data]));
      setInput('');
      setAttachment(null);
    } catch {
      toast.error('Reply failed to send');
    } finally {
      setSending(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) { toast.error('File too large (max 4MB)'); return; }
    const reader = new FileReader();
    reader.onload = () => { setAttachment({ dataUrl: reader.result as string, name: f.name }); toast.success(`Attached ${f.name}`); };
    reader.readAsDataURL(f);
    e.target.value = '';
  };

  const renderAttachment = (url: string, mine: boolean) => {
    if (isImage(url)) {
      return <a href={url} target="_blank" rel="noopener noreferrer" className="block mt-2"><img src={url} alt="attachment" className="max-w-[220px] max-h-[220px] rounded-lg border border-black/10" /></a>;
    }
    return <a href={url} download={fileName(url)} className={cn('flex items-center gap-2 mt-2 px-2 py-1.5 rounded-lg', mine ? 'bg-black/10' : 'bg-[#0D1117]')}><FileText size={14} /> <span className="text-xs underline flex-1 truncate">{fileName(url)}</span> <Download size={12} /></a>;
  };

  const takeOver = async () => {
    if (!active) return;
    await api.post(`/support/tickets/${active}/takeover`).catch(() => {});
    toast.success('You have taken over this chat');
    loadTickets();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Support Console</h1><p className="text-sm text-[#8B949E]">Manage live chats and tickets in real time</p></div>
        <Button variant="outline" leftIcon={<RefreshCw size={15} />} onClick={loadTickets}>Refresh</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><h3 className="font-semibold">Conversations</h3></CardHeader>
          <CardBody className="p-0">
            {tickets.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#8B949E]">No conversations yet.</div>
            ) : tickets.map((t) => (
              <button key={t.id} onClick={() => setActive(t.id)} className={cn('w-full flex items-start gap-3 px-4 py-3 border-b border-[#21262D]/50 text-left hover:bg-[#1C2128] transition-colors', active === t.id && 'bg-amber-500/5')}>
                <div className="w-8 h-8 rounded-full bg-[#21262D] flex items-center justify-center text-xs shrink-0">{getInitials(t.user?.name || '?')}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{t.user?.name || 'User'}</div>
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
              <div><div className="font-semibold">{ticket?.user?.name || 'Select a conversation'}</div><div className="text-xs text-[#8B949E]">{ticket ? `${ticket.subject} · ${ticket.user?.email || ''}` : ''}</div></div>
              {ticket && <Button size="sm" onClick={takeOver}>Take Over</Button>}
            </div>
          </CardHeader>
          <CardBody className="flex-1 space-y-4 max-h-[420px] overflow-y-auto">
            {!ticket ? (
              <div className="py-16 text-center text-sm text-[#8B949E]">Pick a conversation on the left to view and reply.</div>
            ) : messages.length === 0 ? (
              <div className="py-16 text-center text-sm text-[#8B949E]">No messages yet in this conversation.</div>
            ) : messages.map((m, i) => {
              const mine = m.senderId === user?.id;
              const staff = m.sender?.role === 'ADMIN' || m.sender?.role === 'SUPPORT' || m.sender?.role === 'SUPER_ADMIN';
              const prev = messages[i - 1];
              const showLabel = !prev || prev.senderId !== m.senderId;
              return (
                <div key={m.id} className={cn('flex flex-col max-w-[78%]', mine ? 'ml-auto items-end' : 'items-start', showLabel ? 'mt-2' : 'mt-0.5')}>
                  {showLabel && <span className="text-xs text-[#8B949E] mb-1 px-1">{mine ? 'You' : m.sender?.name || 'User'}{!mine && staff ? ' (Staff)' : ''} · {formatDate(m.createdAt, 'time')}</span>}
                  <div className={cn('px-3.5 py-2 text-sm leading-snug', mine ? 'bg-[#0A84FF] text-white rounded-[20px] rounded-br-[6px]' : 'bg-[#26262B] text-[#E6EDF3] rounded-[20px] rounded-bl-[6px]')}>
                    {m.content && <div className="whitespace-pre-wrap break-words">{m.content}</div>}
                    {m.fileUrl && renderAttachment(m.fileUrl, mine)}
                  </div>
                </div>
              );
            })}
            {otherTyping && ticket && (
              <div className="flex flex-col items-start mt-2">
                <div className="bg-[#26262B] rounded-[20px] rounded-bl-[6px] px-4 py-3 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#8B949E] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#8B949E] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#8B949E] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </CardBody>

          {attachment && (
            <div className="px-3 py-2 border-t border-[#21262D] flex items-center gap-2 text-sm">
              {isImage(attachment.dataUrl) ? <img src={attachment.dataUrl} alt="" className="w-8 h-8 rounded object-cover" /> : <FileText size={14} className="text-amber-400" />}
              <span className="flex-1 truncate">{attachment.name}</span>
              <button onClick={() => setAttachment(null)} className="text-[#8B949E] hover:text-red-400">×</button>
            </div>
          )}

          <div className="p-3 border-t border-[#21262D] flex items-center gap-2">
            <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={handleFile} />
            <button className="p-2 text-[#8B949E] hover:text-amber-400" onClick={() => fileRef.current?.click()} disabled={!ticket}><Paperclip size={18} /></button>
            <input value={input} onChange={(e) => { setInput(e.target.value); if (e.target.value.trim()) pingTyping(); }} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder={ticket ? 'Message' : 'Select a conversation'} disabled={!ticket} className="flex-1 bg-[#111318] border border-[#21262D] rounded-full px-4 py-2 text-sm outline-none focus:border-[#0A84FF]/60 disabled:opacity-50" />
            <Button size="md" isLoading={sending} onClick={send} disabled={!ticket} className="!px-3"><Send size={16} /></Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
