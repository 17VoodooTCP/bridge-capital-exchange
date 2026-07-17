'use client';
import { useState } from 'react';
import { Bot, Send, User, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

interface BotMsg {
  id: number;
  from: 'bot' | 'user';
  text: string;
}

const QUICK_REPLIES = ['Check balance', 'Deposit help', 'Withdrawal status', 'Contact agent'];

const BOT_RESPONSES: Record<string, string> = {
  'Check balance': 'You can view your full balance any time under Wallet → Total Balance, with a per-asset breakdown.',
  'Deposit help': 'To deposit, go to Wallet → Deposit, choose your asset and network, then send funds to the address shown. Deposits credit after network confirmations.',
  'Withdrawal status': 'Most withdrawals process within 30 minutes. You can track status under Wallet → Transaction History.',
  'Contact agent': "I'll connect you with a live support agent now. Please hold while I escalate your conversation.",
};

export function SupportBot({ onEscalate }: { onEscalate?: () => void }) {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(' ')[0] || 'there';
  const [messages, setMessages] = useState<BotMsg[]>([
    { id: 1, from: 'bot', text: `👋 Hi ${firstName}! I'm the Bridge Capital Support Bot. How can I help you today? Pick an option below or type your question.` },
  ]);
  const [input, setInput] = useState('');

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const userMsg: BotMsg = { id: Date.now(), from: 'user', text };
    setMessages((m) => [...m, userMsg]);
    setInput('');

    setTimeout(() => {
      const reply = BOT_RESPONSES[text] || "Thanks for your message. I'm escalating this to a human agent who can assist you further.";
      setMessages((m) => [...m, { id: Date.now() + 1, from: 'bot', text: reply }]);
      if (text === 'Contact agent') setTimeout(() => onEscalate?.(), 600);
    }, 700);
  };

  return (
    <div className="flex flex-col h-full bg-[#161B22] border border-[#21262D] rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#21262D] bg-[#0D1117]">
        <div className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center">
          <Bot size={18} className="text-amber-400" />
        </div>
        <div>
          <div className="text-sm font-semibold">BCE Support Bot</div>
          <div className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Online</div>
        </div>
        <Button size="xs" variant="outline" className="ml-auto" rightIcon={<ArrowUpRight size={12} />} onClick={onEscalate}>
          Live agent
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={cn('flex gap-2 max-w-[85%]', m.from === 'user' ? 'ml-auto flex-row-reverse' : '')}>
            <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shrink-0', m.from === 'bot' ? 'bg-amber-500/15' : 'bg-[#21262D]')}>
              {m.from === 'bot' ? <Bot size={14} className="text-amber-400" /> : <User size={14} className="text-[#8B949E]" />}
            </div>
            <div className={cn('px-3 py-2 rounded-2xl text-sm', m.from === 'bot' ? 'bg-[#21262D] text-[#E6EDF3] rounded-tl-sm' : 'bg-amber-500 text-black rounded-tr-sm')}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pb-2 flex flex-wrap gap-2">
        {QUICK_REPLIES.map((q) => (
          <button key={q} onClick={() => handleSend(q)} className="px-3 py-1.5 text-xs rounded-full border border-[#21262D] text-[#8B949E] hover:border-amber-500/40 hover:text-amber-400 transition-colors">
            {q}
          </button>
        ))}
      </div>

      <div className="p-3 border-t border-[#21262D] flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          placeholder="Type your message..."
          className="flex-1 bg-[#111318] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#E6EDF3] outline-none focus:border-amber-500/50"
        />
        <Button size="md" onClick={() => handleSend(input)} className="!px-3"><Send size={16} /></Button>
      </div>
    </div>
  );
}
