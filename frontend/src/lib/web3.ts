/**
 * Minimal real Web3 helpers over the injected EIP-1193 provider
 * (MetaMask, Coinbase Wallet extension, Brave, Trust extension, etc.)
 * No mock behavior: every call here hits the actual wallet.
 */

export interface Eip1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, cb: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, cb: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export function getInjectedProvider(): Eip1193Provider | null {
  if (typeof window === 'undefined') return null;
  return window.ethereum ?? null;
}

/** Prompts the wallet's connect dialog; resolves to the selected address. */
export async function connectInjected(): Promise<string> {
  const provider = getInjectedProvider();
  if (!provider) throw new Error('NO_WALLET');
  const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];
  if (!accounts?.length) throw new Error('NO_ACCOUNTS');
  return accounts[0];
}

export async function getChainId(): Promise<string> {
  const provider = getInjectedProvider();
  if (!provider) throw new Error('NO_WALLET');
  return (await provider.request({ method: 'eth_chainId' })) as string;
}

/** Ensures the wallet is on Ethereum mainnet (chainId 0x1). */
export async function ensureMainnet(): Promise<void> {
  const provider = getInjectedProvider();
  if (!provider) throw new Error('NO_WALLET');
  const chainId = await getChainId();
  if (chainId !== '0x1') {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x1' }],
    });
  }
}

/** Converts a decimal string amount to a hex-encoded integer of `decimals` units. */
export function parseUnits(amount: string, decimals: number): string {
  const [whole = '0', frac = ''] = amount.split('.');
  const fracPadded = (frac + '0'.repeat(decimals)).slice(0, decimals);
  const units = BigInt(whole || '0') * 10n ** BigInt(decimals) + BigInt(fracPadded || '0');
  return '0x' + units.toString(16);
}

/** Sends native ETH from the connected wallet to `to`. Returns the tx hash. */
export async function sendEth(from: string, to: string, amountEth: string): Promise<string> {
  const provider = getInjectedProvider();
  if (!provider) throw new Error('NO_WALLET');
  await ensureMainnet();
  return (await provider.request({
    method: 'eth_sendTransaction',
    params: [{ from, to, value: parseUnits(amountEth, 18) }],
  })) as string;
}

// USDT (ERC-20) on Ethereum mainnet — 6 decimals
const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const TRANSFER_SELECTOR = '0xa9059cbb';

/** Sends ERC-20 USDT from the connected wallet to `to`. Returns the tx hash. */
export async function sendUsdt(from: string, to: string, amountUsdt: string): Promise<string> {
  const provider = getInjectedProvider();
  if (!provider) throw new Error('NO_WALLET');
  await ensureMainnet();
  const paddedTo = to.toLowerCase().replace('0x', '').padStart(64, '0');
  const paddedAmount = parseUnits(amountUsdt, 6).replace('0x', '').padStart(64, '0');
  return (await provider.request({
    method: 'eth_sendTransaction',
    params: [{ from, to: USDT_CONTRACT, value: '0x0', data: `${TRANSFER_SELECTOR}${paddedTo}${paddedAmount}` }],
  })) as string;
}

/** Real message signature via the wallet (personal_sign). */
export async function signMessage(address: string, message: string): Promise<string> {
  const provider = getInjectedProvider();
  if (!provider) throw new Error('NO_WALLET');
  const hex = '0x' + Array.from(new TextEncoder().encode(message)).map((b) => b.toString(16).padStart(2, '0')).join('');
  return (await provider.request({ method: 'personal_sign', params: [hex, address] })) as string;
}
