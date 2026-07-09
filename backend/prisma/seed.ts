import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ── Admin account ──────────────────────────────────────────────────
  // Password comes from SEED_ADMIN_PASSWORD env — never hardcode credentials.
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) {
    console.log('⚠️  SEED_ADMIN_PASSWORD not set — skipping admin creation');
  }
  const admin = adminPassword
    ? await prisma.user.upsert({
        where: { email: process.env.SEED_ADMIN_EMAIL || 'admin@bridgecapital.com' },
        update: {},
        create: {
          email: process.env.SEED_ADMIN_EMAIL || 'admin@bridgecapital.com',
          name: 'Platform Admin',
          passwordHash: await bcrypt.hash(adminPassword, 10),
          role: 'SUPER_ADMIN',
          kycStatus: 'APPROVED',
          twoFactorEnabled: false,
          country: 'US',
        },
      })
    : null;

  // ── Staking plans ──────────────────────────────────────────────────
  const plans = [
    { asset: 'BTC', name: 'BTC Fixed 30-Day', apr: 5.0, duration: 30, isFlexible: false, minAmount: 0.001 },
    { asset: 'ETH', name: 'ETH Flexible Earn', apr: 4.5, duration: 0, isFlexible: true, minAmount: 0.01 },
    { asset: 'USDT', name: 'USDT Fixed 90-Day', apr: 8.0, duration: 90, isFlexible: false, minAmount: 100 },
    { asset: 'SOL', name: 'SOL Fixed 60-Day', apr: 6.5, duration: 60, isFlexible: false, minAmount: 1 },
    { asset: 'BNB', name: 'BNB Flexible Earn', apr: 3.8, duration: 0, isFlexible: true, minAmount: 0.1 },
    { asset: 'USDC', name: 'USDC 30-Day Earn', apr: 7.2, duration: 30, isFlexible: false, minAmount: 50 },
  ];
  for (const p of plans) {
    const exists = await prisma.stakingPlan.findFirst({ where: { name: p.name } });
    if (!exists) await prisma.stakingPlan.create({ data: p });
  }

  // ── Deposit wallet configs ─────────────────────────────────────────
  const wallets = [
    { asset: 'USDT', network: 'TRC20', address: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE', minDeposit: 10, confirmations: 1 },
    { asset: 'USDT', network: 'ERC20', address: '0x742d35Cc6634C0532925a3b8D4C1C9f8e4f8a8b', minDeposit: 20, confirmations: 12 },
    { asset: 'BTC', network: 'Bitcoin', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', minDeposit: 0.0005, confirmations: 6 },
    { asset: 'ETH', network: 'ERC20', address: '0x8f4a8b2c1d9e3f6a5b0c8d7e2f4a1b9c3d5e7f0a', minDeposit: 0.01, confirmations: 12 },
  ];
  for (const w of wallets) {
    await prisma.walletConfig.upsert({
      where: { asset_network: { asset: w.asset, network: w.network } },
      update: {},
      create: w,
    });
  }

  console.log('✅ Seed complete');
  if (admin) console.log(`   Admin account ready: ${admin.email}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
