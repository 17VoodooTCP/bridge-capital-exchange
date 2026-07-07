import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/** Redistributes existing traders' risk to a realistic 20/55/25 split, deterministically by id. */
async function main() {
  const traders = await prisma.trader.findMany({ orderBy: { createdAt: 'asc' }, select: { id: true } });
  console.log(`Rebalancing ${traders.length} traders...`);

  for (let i = 0; i < traders.length; i++) {
    const pct = (i * 100) / traders.length;
    const riskLevel = pct < 20 ? 'LOW' : pct < 75 ? 'MEDIUM' : 'HIGH';
    const winRate = riskLevel === 'LOW' ? 58 + Math.random() * 16 : riskLevel === 'MEDIUM' ? 48 + Math.random() * 20 : 40 + Math.random() * 22;
    const roi30d = riskLevel === 'LOW' ? 2 + Math.random() * 7 : riskLevel === 'MEDIUM' ? 4 + Math.random() * 18 : -6 + Math.random() * 54;
    await prisma.trader.update({
      where: { id: traders[i].id },
      data: {
        riskLevel,
        winRate: parseFloat(winRate.toFixed(1)),
        roi30d: parseFloat(roi30d.toFixed(1)),
      },
    });
  }
  console.log('✅ Rebalanced');
}

main().catch(console.error).finally(() => prisma.$disconnect());
