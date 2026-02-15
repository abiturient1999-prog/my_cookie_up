import { isAddress } from "viem";

const DEFAULT_CONTRACT_ADDRESS =
  "0xEdE3bd8e85557DA8184cfF520d617489CC7e4093";
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
