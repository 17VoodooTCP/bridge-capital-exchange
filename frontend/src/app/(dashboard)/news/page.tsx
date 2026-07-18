'use client';
import { useState, useEffect } from 'react';
import { Clock, TrendingUp, TrendingDown, Minus, ExternalLink, Newspaper } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockNews, mockSignals } from '@/lib/mockData';
import { PriceTicker } from '@/components/layout/PriceTicker';
import { FINNHUB_KEY } from '@/lib/logos';
import { formatDate, formatCurrency, cn } from '@/lib/utils';

interface LiveArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  imageUrl: string;
  category: 'CRYPTO' | 'STOCKS';
  publishedAt: string;
}

const CATEGORIES = ['ALL', 'CRYPTO', 'STOCKS'];

function NewsImage({ src, category, className }: { src?: string; category: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={cn('bg-gradient-to-br from-amber-500/20 to-orange-600/10 flex items-center justify-center', className)}>
        <Badge variant="warning">{category}</Badge>
      </div>
    );
  }
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <img src={src} alt="" className="w-full h-full object-cover" onError={() => setFailed(true)} loading="lazy" />
      <span className="absolute top-2 left-2"><Badge variant="warning">{category}</Badge></span>
    </div>
  );
}

export default function NewsPage() {
  const [cat, setCat] = useState('ALL');
  const [articles, setArticles] = useState<LiveArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [cryptoRes, generalRes] = await Promise.allSettled([
          fetch(`https://finnhub.io/api/v1/news?category=crypto&token=${FINNHUB_KEY}`),
          fetch(`https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_KEY}`),
        ]);

        const parse = async (r: PromiseSettledResult<Response>, category: 'CRYPTO' | 'STOCKS') => {
          if (r.status !== 'fulfilled' || !r.value.ok) return [];
          const data: Array<{ id: number; headline: string; summary: string; source: string; url: string; image: string; datetime: number }> = await r.value.json();
          return data.slice(0, 12).map((a) => ({
            id: `${category}-${a.id}`,
            title: a.headline,
            summary: a.summary || 'Read the full story at the source.',
            source: a.source,
            url: a.url,
            imageUrl: a.image,
            category,
            publishedAt: new Date(a.datetime * 1000).toISOString(),
          }));
        };

        const crypto = await parse(cryptoRes, 'CRYPTO');
        const general = await parse(generalRes, 'STOCKS');
        const merged = [...crypto, ...general].sort(
          (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );

        if (!cancelled && merged.length > 0) {
          setArticles(merged);
          setIsLive(true);
        }
      } catch {
        // network/rate-limit — fall back to bundled headlines
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 120000); // refresh every 2 minutes
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  // Fallback to bundled mock headlines when live feed unavailable
  const feed: LiveArticle[] = articles.length > 0
    ? articles
    : mockNews.map((n) => ({
        id: n.id, title: n.title, summary: n.summary, source: n.source, url: n.sourceUrl,
        imageUrl: '', category: n.category === 'CRYPTO' ? 'CRYPTO' : 'STOCKS', publishedAt: n.publishedAt,
      }));

  const filtered = feed.filter((n) => cat === 'ALL' || n.category === cat);
  const [featured, ...rest] = filtered;

  const actionIcon = (a: string) => a === 'BUY' ? <TrendingUp size={14} className="text-green-400" /> : a === 'SELL' ? <TrendingDown size={14} className="text-red-400" /> : <Minus size={14} className="text-[#8B949E]" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">News &amp; Insights</h1>
          <p className="text-sm text-[#8B949E]">Market news, analysis, and trading signals</p>
        </div>
        {isLive && <Badge variant="success" dot>Live feed · updates every 2 min</Badge>}
      </div>

      {/* Live crypto / stock / ETF prices + 24h change */}
      <PriceTicker />

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={cn('px-4 py-2 text-sm rounded-full border transition-all', cat === c ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-[#21262D] text-[#8B949E] hover:border-[#30363D]')}>{c}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {loading && articles.length === 0 ? (
            <Card className="h-72 flex items-center justify-center">
              <div className="text-center text-[#8B949E]">
                <Newspaper size={32} className="mx-auto mb-2 animate-pulse" />
                <span className="text-sm">Loading live market news…</span>
              </div>
            </Card>
          ) : (
            <>
              {featured && (
                <a href={featured.url} target="_blank" rel="noopener noreferrer" className="block">
                  <Card hover className="overflow-hidden">
                    <NewsImage src={featured.imageUrl} category={featured.category} className="h-56 w-full" />
                    <CardBody>
                      <h2 className="text-xl font-bold mb-2 flex items-start gap-2">{featured.title} <ExternalLink size={14} className="text-[#8B949E] shrink-0 mt-1.5" /></h2>
                      <p className="text-sm text-[#8B949E] mb-3 line-clamp-3">{featured.summary}</p>
                      <div className="flex items-center gap-3 text-xs text-[#8B949E]">
                        <span className="font-medium text-amber-400">{featured.source}</span><span>·</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(featured.publishedAt, 'relative')}</span>
                      </div>
                    </CardBody>
                  </Card>
                </a>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                {rest.slice(0, 12).map((n) => (
                  <a key={n.id} href={n.url} target="_blank" rel="noopener noreferrer" className="block">
                    <Card hover className="overflow-hidden h-full">
                      <NewsImage src={n.imageUrl} category={n.category} className="h-32 w-full" />
                      <CardBody>
                        <h3 className="font-semibold mb-1 line-clamp-2 text-sm">{n.title}</h3>
                        <p className="text-xs text-[#8B949E] line-clamp-2 mb-2">{n.summary}</p>
                        <div className="flex items-center gap-2 text-xs text-[#6E7681]"><span className="text-amber-400/80">{n.source}</span><span>·</span><span>{formatDate(n.publishedAt, 'relative')}</span></div>
                      </CardBody>
                    </Card>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Signals center */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Signals Center</h3>
                <Badge variant="success" dot>Live</Badge>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {mockSignals.map((s) => (
                <div key={s.id} className="px-5 py-4 border-b border-[#21262D]/50 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{s.symbol}</span>
                      <Badge variant={s.action === 'BUY' ? 'success' : s.action === 'SELL' ? 'danger' : 'default'} size="sm">{actionIcon(s.action)} {s.action}</Badge>
                    </div>
                    <span className="text-xs text-[#8B949E]">{s.timeframe}</span>
                  </div>
                  <p className="text-xs text-[#8B949E] mb-2">{s.analysis}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8B949E]">Target: <span className="text-green-400">{formatCurrency(s.targetPrice)}</span></span>
                    <span className="text-[#8B949E]">Stop: <span className="text-red-400">{formatCurrency(s.stopLoss)}</span></span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-[#21262D] overflow-hidden"><div className="h-full bg-amber-500" style={{ width: `${s.confidence}%` }} /></div>
                    <span className="text-xs text-amber-400">{s.confidence}%</span>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
