'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, HeadphonesIcon, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockChatMessages } from '@/lib/mockData';
import { formatDate, cn } from '@/lib/utils';
import type { ChatMessage } from '@/types';
import toast from 'react-hot-toast';

export function LiveChat({ className }: { className?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [input, setInput] = useState('');
  const [agentTyping, setAgentTyping] = useState(false);
  const [attachment, setAttachment] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, agentTyping]);

  const send = () => {
    if (!input.trim() && !attachment) return;
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      ticketId: 'ticket-001',
      senderId: 'user-001',
      senderName: 'You',
      senderRole: 'USER',
      content: input || 'Sent an attachment',
      fileUrl: attachment || undefined,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setMessages((m) => [...m, msg]);
    setInput('');
    setAttachment(null);

    setAgentTyping(true);
    setTimeout(() => {
      setAgentTyping(false);
      setMessages((m) => [
        ...m,
        {
          id: `msg-${Date.now() + 1}`,
          ticketId: 'ticket-001',
          senderId: 'support-001',
          senderName: 'Sarah (Support)',
          senderRole: 'SUPPORT',
          content: "Thanks for reaching out! I'm looking into this for you right now. Could you confirm the transaction ID so I can locate it faster?",
          createdAt: new Date().toISOString(),
          isRead: false,
        },
      ]);
    }, 2200);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setAttachment(f.name);
      toast.success(`Attached ${f.name}`);
    }
  };

  return (
    <div className={cn('flex flex-col bg-[#161B22] border border-[#21262D] rounded-xl overflow-hidden', className)}>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#21262D] bg-[#0D1117]">
        <div className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center">
          <HeadphonesIcon size={18} className="text-amber-400" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold">Live Support</div>
          <div className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Connected · Avg. reply 2 min</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[500px]">
        {messages.map((m) => {
          const mine = m.senderRole === 'USER';
          return (
            <div key={m.id} className={cn('flex flex-col max-w-[80%]', mine ? 'ml-auto items-end' : 'items-start')}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-[#8B949E]">{m.senderName}</span>
                <span className="text-xs text-[#6E7681]">{formatDate(m.createdAt, 'time')}</span>
              </div>
              <div className={cn('px-3.5 py-2.5 rounded-2xl text-sm', mine ? 'bg-amber-500 text-black rounded-tr-sm' : m.senderRole === 'BOT' ? 'bg-[#1C2128] text-[#E6EDF3] rounded-tl-sm' : 'bg-[#21262D] text-[#E6EDF3] rounded-tl-sm')}>
                {m.content}
                {m.fileUrl && (
                  <div className={cn('flex items-center gap-2 mt-2 px-2 py-1.5 rounded-lg', mine ? 'bg-black/10' : 'bg-[#0D1117]')}>
                    <FileText size={14} /> <span className="text-xs underline">{m.fileUrl}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {agentTyping && (
          <div className="flex items-center gap-2 text-xs text-[#8B949E]">
            <span className="font-medium">Sarah is typing</span>
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-[#8B949E] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-[#8B949E] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-[#8B949E] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {attachment && (
        <div className="px-4 py-2 border-t border-[#21262D] flex items-center gap-2 text-sm">
          <FileText size={14} className="text-amber-400" />
          <span className="flex-1 truncate">{attachment}</span>
          <button onClick={() => setAttachment(null)} className="text-[#8B949E] hover:text-red-400"><X size={14} /></button>
        </div>
      )}

      <div className="p-3 border-t border-[#21262D] flex items-center gap-2">
        <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={handleFile} />
        <button onClick={() => fileRef.current?.click()} className="p-2 text-[#8B949E] hover:text-amber-400 transition-colors"><Paperclip size={18} /></button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Type your message..."
          className="flex-1 bg-[#111318] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#E6EDF3] outline-none focus:border-amber-500/50"
        />
        <Button size="md" onClick={send} className="!px-3"><Send size={16} /></Button>
      </div>
    </div>
  );
}
