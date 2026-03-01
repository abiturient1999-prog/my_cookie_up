/**
 * In-memory хранилище клеймов для этапа 1 (dev).
 * На Vercel не персистентно; для прода используем Neon (этап 2).
 * Ключ: "fid:address" (lowercase address).
 */

const COOLDOWN_MS = 24 * 60 * 60 * 1000;

export interface StoredUserClaim {
  lastClaimAt: string;
  txHash?: string;
  totalClaims: number;
}

const store = new Map<string, StoredUserClaim>();

function key(fid: number, address: string): string {
  return `${fid}:${address.toLowerCase()}`;
}

export function getLastClaim(fid: number, address: string): StoredUserClaim | undefined {
  return store.get(key(fid, address));
}

export function setClaim(
  fid: number,
  address: string,
  at: string,
  txHash?: string
): StoredUserClaim {
  const k = key(fid, address);
  const prev = store.get(k);
  const totalClaims = (prev?.totalClaims ?? 0) + 1;
  const next: StoredUserClaim = {
    lastClaimAt: at,
    txHash,
    totalClaims,
  };
  store.set(k, next);
  return next;
}

export function isCooldownActive(lastClaimAt: string): boolean {
  const nextAt = new Date(lastClaimAt).getTime() + COOLDOWN_MS;
  return Date.now() < nextAt;
}

export function getNextClaimAvailableAt(lastClaimAt: string): string {
  const nextAt = new Date(lastClaimAt).getTime() + COOLDOWN_MS;
  return new Date(nextAt).toISOString();
}

export function getRemainingCooldownMs(lastClaimAt: string): number {
  const nextAt = new Date(lastClaimAt).getTime() + COOLDOWN_MS;
  return Math.max(0, nextAt - Date.now());
}

export const COOLDOWN_MS_EXPORT = COOLDOWN_MS;
