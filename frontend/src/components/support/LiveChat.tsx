'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, HeadphonesIcon, FileText, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

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
  if (!url) return '';
  const m = url.match(/name=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : 'attachment';
};

export function LiveChat({ className }: { className?: string }) {
  const { user } = useAuthStore();
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState<{ dataUrl: string; name: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const lastTypingSent = useRef(0);

  // Tell the server we're typing (throttled), so the agent sees the indicator
  const pingTyping = useCallback(() => {
    if (!ticketId) return;
    const now = Date.now();
    if (now - lastTypingSent.current < 1800) return;
    lastTypingSent.current = now;
    api.post(`/support/tickets/${ticketId}/typing`).catch(() => {});
  }, [ticketId]);

  // Ensure a ticket exists, then poll its messages in real time
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setInterval>;
    (async () => {
      try {
        const t = await api.post('/support/chat/ensure');
        if (!alive || !t.data?.id) return;
        setTicketId(t.data.id);
        const poll = async () => {
          const r = await api.get<Msg[]>(`/support/tickets/${t.data.id}/messages`).catch(() => null);
          if (alive && r && Array.isArray(r.data)) setMessages(r.data);
        };
        const pollTyping = async () => {
          const r = await api.get<{ typing: boolean }>(`/support/tickets/${t.data.id}/typing`).catch(() => null);
          if (alive && r) setOtherTyping(!!r.data?.typing);
        };
        await poll();
        timer = setInterval(() => { poll(); pollTyping(); }, 2500);
      } catch {
        /* offline — chat unavailable */
      }
    })();
    return () => { alive = false; clearInterval(timer); };
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, otherTyping]);

  const send = useCallback(async () => {
    if ((!input.trim() && !attachment) || !ticketId) return;
    setSending(true);
    try {
      // Encode the attachment (image → data URL shown inline; other → labeled data URL)
      const fileUrl = attachment
        ? isImage(attachment.dataUrl)
          ? attachment.dataUrl
          : `${attachment.dataUrl}#name=${encodeURIComponent(attachment.name)}`
        : undefined;
      const res = await api.post<Msg>(`/support/tickets/${ticketId}/messages`, {
        content: input || (attachment ? `📎 ${attachment.name}` : ''),
        fileUrl,
      });
      // Optimistically append; the 3s poll will reconcile. No heavy refetch here,
      // so a slow poll can't produce a false "failed" toast after a real send.
      if (res?.data?.id) {
        setMessages((m) => (m.some((x) => x.id === res.data.id) ? m : [...m, res.data]));
      }
      setInput('');
      setAttachment(null);
    } catch {
      toast.error('Message failed to send');
    } finally {
      setSending(false);
    }
  }, [input, attachment, ticketId]);

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
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block mt-2">
          <img src={url} alt="attachment" className="max-w-[220px] max-h-[220px] rounded-lg border border-black/10" />
        </a>
      );
    }
    return (
      <a href={url} download={fileName(url)} className={cn('flex items-center gap-2 mt-2 px-2 py-1.5 rounded-lg', mine ? 'bg-black/10' : 'bg-[#0D1117]')}>
        <FileText size={14} /> <span className="text-xs underline flex-1 truncate">{fileName(url)}</span> <Download size={12} />
      </a>
    );
  };

  return (
    <div className={cn('flex flex-col bg-[#161B22] border border-[#21262D] rounded-xl overflow-hidden', className)}>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#21262D] bg-[#0D1117]">
        <div className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center"><HeadphonesIcon size={18} className="text-amber-400" /></div>
        <div className="flex-1">
          <div className="text-sm font-semibold">Live Support</div>
          <div className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Connected · Avg. reply 2 min</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[500px]">
        {messages.length === 0 && (
          <div className="text-center text-sm text-[#8B949E] py-8">
            Hi {user?.name?.split(' ')[0] || 'there'} — send a message and our team will reply here in real time.
          </div>
        )}
        {messages.map((m, i) => {
          const mine = m.senderId === user?.id;
          const staff = m.sender?.role === 'ADMIN' || m.sender?.role === 'SUPPORT' || m.sender?.role === 'SUPER_ADMIN';
          const label = mine ? 'You' : m.sender?.name ? `${m.sender.name}${staff ? ' (Support)' : ''}` : 'Support';
          // Only label the first message of a consecutive run from the same sender
          const prev = messages[i - 1];
          const showLabel = !prev || prev.senderId !== m.senderId;
          return (
            <div key={m.id} className={cn('flex flex-col max-w-[78%]', mine ? 'ml-auto items-end' : 'items-start', showLabel ? 'mt-2' : 'mt-0.5')}>
              {showLabel && (
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-xs font-medium text-[#8B949E]">{label}</span>
                  <span className="text-xs text-[#6E7681]">{formatDate(m.createdAt, 'time')}</span>
                </div>
              )}
              <div className={cn(
                'px-3.5 py-2 text-sm leading-snug',
                mine
                  ? 'bg-[#0A84FF] text-white rounded-[20px] rounded-br-[6px]'
                  : 'bg-[#26262B] text-[#E6EDF3] rounded-[20px] rounded-bl-[6px]',
              )}>
                {m.content && <div className="whitespace-pre-wrap break-words">{m.content}</div>}
                {m.fileUrl && renderAttachment(m.fileUrl, mine)}
              </div>
            </div>
          );
        })}

        {/* iMessage-style typing indicator */}
        {otherTyping && (
          <div className="flex flex-col items-start mt-2">
            <div className="bg-[#26262B] rounded-[20px] rounded-bl-[6px] px-4 py-3 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#8B949E] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#8B949E] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#8B949E] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {attachment && (
        <div className="px-4 py-2 border-t border-[#21262D] flex items-center gap-2 text-sm">
          {isImage(attachment.dataUrl) ? <img src={attachment.dataUrl} alt="" className="w-8 h-8 rounded object-cover" /> : <FileText size={14} className="text-amber-400" />}
          <span className="flex-1 truncate">{attachment.name}</span>
          <button onClick={() => setAttachment(null)} className="text-[#8B949E] hover:text-red-400"><X size={14} /></button>
        </div>
      )}

      <div className="p-3 border-t border-[#21262D] flex items-center gap-2">
        <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={handleFile} />
        <button onClick={() => fileRef.current?.click()} className="p-2 text-[#8B949E] hover:text-amber-400 transition-colors"><Paperclip size={18} /></button>
        <input value={input} onChange={(e) => { setInput(e.target.value); if (e.target.value.trim()) pingTyping(); }} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Message" className="flex-1 bg-[#111318] border border-[#21262D] rounded-full px-4 py-2 text-sm text-[#E6EDF3] outline-none focus:border-[#0A84FF]/60" />
        <Button size="md" isLoading={sending} onClick={send} className="!px-3"><Send size={16} /></Button>
      </div>
    </div>
  );
}
