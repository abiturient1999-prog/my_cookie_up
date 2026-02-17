'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { sdk } from '@farcaster/miniapp-sdk';
import { encodeFunctionData } from 'viem';
import { 
  Transaction, 
  TransactionButton, 
  TransactionStatus, 
  TransactionStatusLabel, 
  TransactionStatusAction 
} from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contract';
import { getClientPaymasterUrl } from './paymaster';

// Ссылка на твое приложение
const APP_URL = "https://basedcookie.vercel.app"; 

const FORTUNES = [
  "EVERYTHING IS BASED ON @BASE PUMP 🚀",
  "ONCHAIN SUMMER NEVER ENDS ☀️",
  "MINT THE COOKIE, HODL THE CRUMB 🍪",
  "BASED AND BLUE-PILLED 🔵",
  "YOUR GAS IS LOW, BUT YOUR VIBE IS HIGH ✨",
  "EXIT LIQUIDITY? NO, JUST COOKIE LIQUIDITY 🍬",
  "BORN ONCHAIN, RAISED BY DEGENS 👶",
  "WAGMI: WE ARE ALL GONNA MINT COOKIES 🥠",
  "JESSE POLLAK APPROVES THIS MESSAGE 🔵",
  "0.000001 ETH FOR A CRUMB? BULLISH 📈",
  "STAY BASED, STAY CRUNCHY 🛡️",
  "DEGEN LEVEL: MAXIMUM CRUNCH 👾",
  "PAPER HANDS CRUMBLE, DIAMOND HANDS CLINK 💎",
  "ONCHAIN IS THE NEW ONLINE 🌐",
  "GO TO BASE, DON'T LOOK BACK 🔵"
];

export default function Home() {
  const { address } = useAccount();
  const [isCracked, setIsCracked] = useState(false);
  const [fortune, setFortune] = useState("");
  
  const paymasterUrl = getClientPaymasterUrl();
  const hasPaymaster = Boolean(paymasterUrl);

  const capabilities = useMemo(() => {
    if (!paymasterUrl) return undefined;
    return {
      paymasterService: {
        url: paymasterUrl,
      },
    };
  }, [paymasterUrl]);

  const claimRewardData = encodeFunctionData({
    abi: CONTRACT_ABI,
    functionName: 'claimReward',
    args: [],
  });

  const calls = [
    {
      to: CONTRACT_ADDRESS,
      data: claimRewardData,
      value: BigInt(0),
    },
  ];

  useEffect(() => {
    const initSdk = async () => {
      try {
        await sdk.actions.ready();
      } catch (error) {
        console.error("SDK Init Error:", error);
      }
    };
    initSdk();
  }, []);

  const playCrunch = () => {
    const audio = new Audio('/crunch.mp3');
    audio.play();
  };

  const handleCrack = () => {
    if (isCracked) return;
    playCrunch(); 
    setIsCracked(true);
    setFortune(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
  };

  // ИСПРАВЛЕНИЕ 1: Нативный шеринг через SDK
  const handleShare = useCallback(() => {
    const text = `I cracked the cookie and got: ${fortune}\n\nMint yours on Base Sepolia! 🍪`;

    const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(APP_URL)}`;
    sdk.actions.openUrl(warpcastUrl).catch(() => {
      window.open(warpcastUrl, '_blank');
    });
  }, [fortune]);

  return (
    // Добавлен overflow-y-auto для прокрутки на маленьких экранах
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-t from-[#ff71ce] via-[#b967ff] to-[#05ffa1] text-white p-4 font-mono overflow-y-auto">
      
      {/* Уменьшен отступ сверху (mt-8 вместо дефолтного центрирования) */}
      <motion.h1 
        initial={{ y: -50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        className="mt-8 text-3xl md:text-5xl font-black mb-6 tracking-tighter border-4 border-black bg-yellow-400 text-black px-6 py-2 rotate-[-2deg] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center z-10"
        style={{ textShadow: '0 2px 0px rgba(255,255,255,0.5)' }}
      >
        BASED COOKIE
      </motion.h1>

      {/* Зона Печенья: Уменьшена высота контейнера */}
      <div className="relative flex flex-col items-center justify-start w-full max-w-md min-h-[250px]">
        <AnimatePresence mode="wait">
          {!isCracked ? (
            <motion.img
              key="whole"
              src="/cookie-whole.png"
              alt="Cookie"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCrack}
              // ИСПРАВЛЕНИЕ 3: Уменьшен размер печенья для мобилок (w-48 -> w-40 / max-w-[180px])
              className="w-40 max-w-[180px] h-auto cursor-pointer object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] z-20 mt-8"
              exit={{ scale: 0, opacity: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
          ) : (
            <motion.div 
              key="cracked"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center w-full"
            >
              <img 
                src="/cookie-cracked.png" 
                alt="Cracked" 
                className="w-40 max-w-[180px] h-auto object-contain mb-4" 
              />
              
              {/* ИСПРАВЛЕНИЕ 2: Возвращена анимация парения (y: [0, -5, 0]) */}
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ 
                  opacity: 1, 
                  y: [0, -5, 0],
                  rotate: [-1, 1, -1] 
                }}
                transition={{ 
                  opacity: { duration: 0.2 },
                  y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className="relative bg-white text-black p-3 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[90%] text-center"
              >
                {/* Стрелочка облачка */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-black"></div>
                <div className="absolute -top-[10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white"></div>
                
                <p className="font-black text-sm md:text-base uppercase leading-tight tracking-wide mb-2">
                  {fortune}
                </p>

                <button 
                  onClick={handleShare}
                  className="w-full bg-blue-600 text-white font-bold py-1.5 rounded-lg text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Share Fortune</span> 🚀
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Кнопки действий: Уменьшен отступ (mt-4 -> mt-2) */}
      <div className="mt-2 w-full max-w-[280px] z-30 flex justify-center pb-8">
        {isCracked && (
          <motion.div 
            className="w-full"
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
          >
            {address ? (
              <Transaction
                chainId={84532}
                calls={calls}
                isSponsored={hasPaymaster}
                capabilities={capabilities}
              >
                <TransactionButton 
                  className="w-full bg-black text-white border-4 border-white h-12 rounded-xl font-black text-lg hover:bg-yellow-400 hover:text-black hover:border-black transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none" 
                  text="CLAIM REWARD 💰" 
                />
                <TransactionStatus>
                  <TransactionStatusLabel className="text-center mt-2 text-xs font-bold text-white drop-shadow-md" />
                  <TransactionStatusAction />
                </TransactionStatus>
              </Transaction>
            ) : (
              <Wallet>
                <ConnectWallet
                  disconnectedLabel="CONNECT WALLET 🔌"
                  className="w-full !bg-[#0052ff] !text-white !font-black !h-12 !rounded-xl !border-2 !border-white shadow-[0_4px_0_0_rgba(0,0,0,0.2)]"
                />
              </Wallet>
            )}
          </motion.div>
        )}
      </div>

      {/* ИСПРАВЛЕНИЕ 4: Вернул эмодзи печенек */}
      {!isCracked && (
        <motion.p 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-4 text-white font-bold text-xs uppercase tracking-[0.2em] drop-shadow-md pb-8"
        >
          🍪 CLICK TO REVEAL DESTINY 🍪
        </motion.p>
      )}
    </div>
  );
}
