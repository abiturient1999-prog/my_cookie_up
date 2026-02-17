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

// Ссылка на твое приложение (Замени на актуальный домен, если он другой)
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
    audio.play().catch(() => {});
  };

  const handleCrack = () => {
    if (isCracked) return;
    playCrunch(); 
    setIsCracked(true);
    setFortune(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
  };

  // --- ЛОГИКА SHARE ---
  const handleShare = useCallback(() => {
    const text = `I cracked the cookie and got: ${fortune}\n\nMint yours on Base Sepolia! 🍪`;
    
    // Формируем ссылку для нативного компоузера
    // encodeURIComponent важен, чтобы спецсимволы не ломали ссылку
    const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(APP_URL)}`;
    
    // Используем SDK для открытия URL. Base App перехватит этот URL и откроет нативный редактор.
    sdk.actions.openUrl(warpcastUrl);
  }, [fortune]);

  return (
    // h-screen и overflow-hidden предотвращают скролл всей страницы, если контент влезает
    <div className="flex flex-col items-center justify-between min-h-screen h-screen bg-gradient-to-t from-[#ff71ce] via-[#b967ff] to-[#05ffa1] text-white p-4 font-mono overflow-hidden">
      
      {/* 1. ЗАГОЛОВОК (Компактный отступ сверху) */}
      <motion.h1 
        initial={{ y: -50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        className="mt-6 text-3xl font-black tracking-tighter border-4 border-black bg-yellow-400 text-black px-4 py-2 rotate-[-2deg] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center z-10"
        style={{ textShadow: '0 1px 0px rgba(255,255,255,0.5)' }}
      >
        BASED COOKIE
      </motion.h1>

      {/* 2. ЦЕНТРАЛЬНАЯ ЗОНА (Печенье + Предсказание) */}
      {/* flex-grow позволяет занять всё доступное место, но не больше */}
      <div className="flex-grow flex flex-col items-center justify-center w-full max-w-md relative">
        <AnimatePresence mode="wait">
          {!isCracked ? (
            <motion.img
              key="whole"
              src="/cookie-whole.png"
              alt="Cookie"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCrack}
              // Уменьшен размер для мобилок (w-40 / 160px)
              className="w-40 h-auto cursor-pointer object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] z-20"
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
              {/* Расколотое печенье (тоже компактное) */}
              <img 
                src="/cookie-cracked.png" 
                alt="Cracked" 
                className="w-36 h-auto object-contain mb-2" 
              />
              
              {/* ОБЛАЧКО С ПРЕДСКАЗАНИЕМ (С АНИМАЦИЕЙ ПАРЕНИЯ) */}
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ 
                  opacity: 1, 
                  y: [0, -8, 0], // Вернул анимацию парения вверх-вниз
                  rotate: [-1, 1, -1] 
                }}
                transition={{ 
                  opacity: { duration: 0.2 },
                  y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className="relative bg-white text-black p-3 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[90%] text-center mt-2"
              >
                {/* Хвостик облачка */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-black"></div>
                <div className="absolute -top-[10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white"></div>
                
                <p className="font-black text-xs md:text-sm uppercase leading-tight tracking-wide mb-2">
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

      {/* 3. НИЖНЯЯ ЗОНА (Кнопки + Текст) */}
      <div className="w-full max-w-[280px] z-30 flex flex-col items-center justify-end pb-8">
        {isCracked ? (
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
        ) : (
          <motion.p 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-white font-bold text-xs uppercase tracking-[0.2em] drop-shadow-md"
          >
            🍪 CLICK TO REVEAL DESTINY 🍪
          </motion.p>
        )}
      </div>
    </div>
  );
}
