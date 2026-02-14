"use client";

import { useState } from "react";
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction
} from "@coinbase/onchainkit/transaction";
import { useAccount } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract";

const PREDICTIONS = [
  "You will find a great treasure in Base network.",
  "Fortune favors the bold cookie clickers.",
  "A small transaction will bring great joy.",
  "The blockchain has a bright future for you.",
  "Today is a perfect day for a claim."
];

export default function Home() {
  const { address } = useAccount();
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isCracked, setIsCracked] = useState(false);

  const handleCookieClick = () => {
    if (!isCracked) {
      const randomPrediction = PREDICTIONS[Math.floor(Math.random() * PREDICTIONS.length)];
      setPrediction(randomPrediction);
      setIsCracked(true);
    }
  };

  const calls = [{
    to: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: "claimReward",
    args: [],
  }];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-3xl font-bold mb-8">Based Cookie 🍪</h1>

      <div
        onClick={handleCookieClick}
        className={`cursor-pointer transition-transform hover:scale-105 ${isCracked ? 'opacity-50' : ''}`}
      >
        <div className="text-8xl mb-4">{isCracked ? "🥠" : "🍪"}</div>
        <p className="text-gray-500">{isCracked ? "Cookie is cracked!" : "Click the cookie to see your future"}</p>
      </div>

      {prediction && (
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md max-w-sm">
          <p className="italic text-lg">&quot;{prediction}&quot;</p>
        </div>
      )}

      {isCracked && address && (
        <div className="mt-8 w-full max-w-xs">
          <Transaction
            calls={calls}
            // Paymaster URL берется автоматически из провайдера, если настроен env
            onSuccess={() => alert("Reward claimed successfully!")}
            onError={(err) => console.error("Claim error:", err)}
          >
            <TransactionButton text="Claim 0.000008 ETH" className="w-full bg-[#0052FF] text-white rounded-full" />
            <TransactionStatus>
              <TransactionStatusLabel />
              <TransactionStatusAction />
            </TransactionStatus>
          </Transaction>
        </div>
      )}

      {!address && isCracked && (
        <p className="mt-8 text-red-500">Please connect your wallet to claim reward.</p>
      )}
    </div>
  );
}
