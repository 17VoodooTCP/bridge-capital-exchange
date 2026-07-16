'use client';
import { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LiveChat } from '@/components/support/LiveChat';
import { SupportBot } from '@/components/support/SupportBot';
import { mockTickets } from '@/lib/mockData';
import { FAQ_ITEMS, STATUS_COLORS } from '@/lib/constants';
import { formatDate, cn } from '@/lib/utils';

export default function SupportPage() {
  const [tab, setTab] = useState('chat');
  const [escalated, setEscalated] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Support</h1>
        <p className="text-sm text-[#8B949E]">Get help from our team — available 24/7</p>
      </div>

      <Tabs
        tabs={[{ id: 'chat', label: 'Live Chat' }, { id: 'tickets', label: 'My Tickets', count: mockTickets.length }, { id: 'faq', label: 'FAQ' }]}
        activeTab={tab}
        onChange={setTab}
        variant="underline"
      />

      {tab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {escalated ? <LiveChat className="lg:col-span-2 max-w-3xl mx-auto w-full" /> : (
            <>
              <SupportBot onEscalate={() => setEscalated(true)} />
              <Card>
                <CardHeader><h3 className="font-semibold">Need a human?</h3></CardHeader>
                <CardBody className="space-y-3">
                  <p className="text-sm text-[#8B949E]">Our bot can handle most questions instantly. For account-specific issues, escalate to a live agent anytime.</p>
                  <Button onClick={() => setEscalated(true)}>Talk to a live agent</Button>
                  <div className="text-sm pt-2 border-t border-[#21262D]">
                    <span className="text-[#8B949E]">Or email us: </span>
                    <a href="mailto:support@bridgecapitalv1.com" className="text-amber-400 hover:text-amber-300">support@bridgecapitalv1.com</a>
                  </div>
                  <div className="text-xs text-[#8B949E]">Average response time: <span className="text-green-400">2 minutes</span></div>
                </CardBody>
              </Card>
            </>
          )}
        </div>
      )}

      {tab === 'tickets' && (
        <Card>
          <div className="p-4 flex items-center justify-between border-b border-[#21262D]">
            <h3 className="font-semibold">Support Tickets</h3>
            <Button size="sm" leftIcon={<Plus size={14} />}>New Ticket</Button>
          </div>
          <CardBody className="p-0">
            {mockTickets.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-4 border-b border-[#21262D]/50 last:border-0 hover:bg-[#1C2128] transition-colors cursor-pointer">
                <div className="flex-1">
                  <div className="font-medium">{t.subject}</div>
                  <div className="text-xs text-[#8B949E]">#{t.id.slice(-4)} · {t.category} · {formatDate(t.updatedAt, 'relative')}</div>
                </div>
                <Badge variant={t.priority === 'HIGH' || t.priority === 'URGENT' ? 'danger' : t.priority === 'MEDIUM' ? 'warning' : 'default'} size="sm">{t.priority}</Badge>
                <span className={cn('text-xs px-2 py-1 rounded-full', STATUS_COLORS[t.status])}>{t.status.replace('_', ' ')}</span>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {tab === 'faq' && (
        <Card className="max-w-3xl">
          <CardBody className="p-0">
            {FAQ_ITEMS.map((f, i) => (
              <div key={i} className="border-b border-[#21262D]/50 last:border-0">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#1C2128] transition-colors">
                  <span className="font-medium text-sm">{f.question}</span>
                  <ChevronDown size={16} className={cn('text-[#8B949E] transition-transform', openFaq === i && 'rotate-180')} />
                </button>
                {openFaq === i && <div className="px-5 pb-4 text-sm text-[#8B949E]">{f.answer}</div>}
              </div>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
