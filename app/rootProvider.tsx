"use client";
import { ReactNode } from "react";
import { base, baseSepolia } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import "@coinbase/onchainkit/styles.css";
import { getClientPaymasterUrl } from "./paymaster";
import { getChainId } from "@/lib/network";

const BASE_MAINNET_CHAIN_ID = 8453;

export function RootProvider({ children }: { children: ReactNode }) {
  const paymasterUrl = getClientPaymasterUrl();
  const chainId = getChainId();
  const chain = chainId === BASE_MAINNET_CHAIN_ID ? base : baseSepolia;

  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={chain}
      config={{
        appearance: {
          mode: "auto",
        },
        paymaster: paymasterUrl,
        wallet: {
          display: "modal",
          preference: "all",
        },
      }}
      miniKit={{
        enabled: true,
        autoConnect: true,
        notificationProxyUrl: undefined,
      }}
    >
      {children}
    </OnchainKitProvider>
  );
}
