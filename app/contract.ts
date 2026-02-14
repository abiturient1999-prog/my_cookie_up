import { isAddress } from "viem";

const DEFAULT_CONTRACT_ADDRESS =
  "0x5ABE2aE9912906BcA33DbDB2484CD1B471bB0684";
const configuredContractAddress =
  process.env.NEXT_PUBLIC_COOKIEJAR_ADDRESS?.trim() ||
  process.env.NEXT_PUBLIC_COOKIEFAUCET_ADDRESS?.trim() ||
  DEFAULT_CONTRACT_ADDRESS;

export const CONTRACT_ADDRESS = (
  isAddress(configuredContractAddress)
    ? configuredContractAddress
    : DEFAULT_CONTRACT_ADDRESS
) as `0x${string}`;

export const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "claimReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
