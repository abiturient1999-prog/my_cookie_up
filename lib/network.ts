const BASE_NETWORK_MAINNET = "mainnet";
const BASE_SEPOLIA_CHAIN_ID = 84532;
const BASE_MAINNET_CHAIN_ID = 8453;
const EXPLORER_SEPOLIA = "https://sepolia.basescan.org";
const EXPLORER_MAINNET = "https://basescan.org";

/** Текущая сеть из env. По умолчанию sepolia. */
export function getBaseNetwork(): "sepolia" | "mainnet" {
  const v = process.env.NEXT_PUBLIC_BASE_NETWORK?.trim().toLowerCase();
  return v === BASE_NETWORK_MAINNET ? "mainnet" : "sepolia";
}

export function getChainId(): number {
  return getBaseNetwork() === "mainnet" ? BASE_MAINNET_CHAIN_ID : BASE_SEPOLIA_CHAIN_ID;
}

export function getExplorerTxUrl(txHash: string): string {
  const base = getBaseNetwork() === "mainnet" ? EXPLORER_MAINNET : EXPLORER_SEPOLIA;
  return `${base}/tx/${txHash}`;
}
