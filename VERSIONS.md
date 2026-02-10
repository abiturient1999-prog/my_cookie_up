# Versions

## 2026-02-09 19:25 - Stable baseline (cookie cracks once, background works)

Description: Current stable state of `app/page.tsx` with working gradient background and single crack animation.

Restore Point: `app/page.tsx`
```tsx
'use client';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion'; // Для крутых анимаций
import { 
  Transaction, 
  TransactionButton, 
  TransactionStatus, 
  TransactionStatusLabel, 
  TransactionStatusAction 
} from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';

const contractAbi = [{ type: 'function', name: 'claim', inputs: [], outputs: [], stateMutability: 'nonpayable' }] as const;

const FORTUNES = [
  "EVERYTHING IS BASED ON @BASE 🔵",
  "ONCHAIN SUMMER NEVER ENDS ☀️",
  "MINT THE COOKIE, HODL THE CRUMB 🍪",
  "BASED AND BLUE-PILLED 🔵",
  "YOUR GAS IS LOW, BUT YOUR VIBE IS HIGH ⛽",
  "EXIT LIQUIDITY? NO, JUST COOKIE LIQUIDITY 🍬",
  "BORN ONCHAIN, RAISED BY DEGENS 👶",
  "WAGMI: WE ARE ALL GONNA MINT COOKIES 🥛",
  "JESSE POLLAK APPROVES THIS MESSAGE 🔵",
  "0.000001 ETH FOR A CRUMB? BULLISH 📈",
  "STAY BASED, STAY CRUNCHY 🛡️",
  "DEGEN LEVEL: MAXIMUM CRUNCH 👹",
  "PAPER HANDS CRUMBLE, DIAMOND HANDS CLINK 💎",
  "ONCHAIN IS THE NEW ONLINE 🌐",
  "GO TO BASE, DON'T LOOK BACK 🔵"
];

export default function Home() {
  const { address } = useAccount();
  const [isCracked, setIsCracked] = useState(false);
  const [fortune, setFortune] = useState("");

  const contractAddress = process.env.NEXT_PUBLIC_COOKIEJAR_ADDRESS as `0x${string}`;

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-t from-[#ff71ce] via-[#b967ff] to-[#05ffa1] text-white p-6 font-mono">
      {/* Заголовок в стиле ретро-комикса */}
      <motion.h1 
        initial={{ y: -20 }} animate={{ y: 0 }}
        className="text-4xl font-black mb-12 tracking-tighter border-4 border-black bg-yellow-400 text-black px-4 py-2 rotate-[-2deg] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        style={{ textShadow: '0 2px 2px rgba(0, 0, 0, 0.85)' }}
      >
        BASED COOKIE
      </motion.h1>

      {/* Зона Печенья */}
      <div className="relative flex items-center justify-center h-64">
        <AnimatePresence mode="wait">
          {!isCracked ? (
            <motion.img
              key="whole"
              src="/cookie-whole.png"
              alt="Cookie"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCrack}
              className="w-48 h-48 cursor-pointer object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
              exit={{ scale: 0, opacity: 0, rotate: 180 }}
            />
          ) : (
            <motion.div 
              key="cracked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <img src="/cookie-cracked.png" alt="Cracked" className="w-56 h-56 object-contain" />
              
              {/* Облачко с предсказанием */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 bg-white text-black p-4 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[250px] relative"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white"></div>
                <p className="font-black text-center text-sm uppercase leading-tight">{fortune}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Кнопка транзакции */}
      {isCracked && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-12 w-full max-w-[280px]"
        >
          {address ? (
            <Transaction
              chainId={84532}
              calls={[{ to: contractAddress, abi: contractAbi, functionName: 'claim' }]}
              isSponsored // Спонсирование газа включено
            >
              <TransactionButton className="w-full bg-black text-white border-4 border-white h-16 rounded-none font-black text-xl hover:bg-yellow-400 hover:text-black hover:border-black transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                CLAIM YOUR $ NOW
              </TransactionButton>
              <TransactionStatus>
                <TransactionStatusLabel className="text-center mt-2 text-xs" />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
          ) : (
            <Wallet>
              <div className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <ConnectWallet
                  disconnectedLabel="CONNECT WALLET AND CLAIM YOUR PRIZE"
                  className="w-full bg-transparent text-black font-black border-0 rounded-none hover:bg-yellow-400 transition-all active:shadow-none active:translate-x-1 active:translate-y-1"
                />
              </div>
            </Wallet>
          )}
        </motion.div>
      )}

      {!isCracked && (
        <p className="mt-12 text-blue-200 animate-pulse text-xs uppercase tracking-widest">
          — Click to reveal destiny —
        </p>
      )}
    </div>
  );
}
```

## 
2026-02-09 19:28
 - Add subtle shake to whole cookie and float fortune bubble

Description: Add subtle shaking to the whole cookie pre-click and floating animation to the fortune bubble.

Restore Point: `app/page.tsx`
```tsx
'use client';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion'; // Для крутых анимаций
import { 
  Transaction, 
  TransactionButton, 
  TransactionStatus, 
  TransactionStatusLabel, 
  TransactionStatusAction 
} from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';

const contractAbi = [{ type: 'function', name: 'claim', inputs: [], outputs: [], stateMutability: 'nonpayable' }] as const;

const FORTUNES = [
  "EVERYTHING IS BASED ON @BASE 🔵",
  "ONCHAIN SUMMER NEVER ENDS ☀️",
  "MINT THE COOKIE, HODL THE CRUMB 🍪",
  "BASED AND BLUE-PILLED 🔵",
  "YOUR GAS IS LOW, BUT YOUR VIBE IS HIGH ⛽",
  "EXIT LIQUIDITY? NO, JUST COOKIE LIQUIDITY 🍬",
  "BORN ONCHAIN, RAISED BY DEGENS 👶",
  "WAGMI: WE ARE ALL GONNA MINT COOKIES 🥛",
  "JESSE POLLAK APPROVES THIS MESSAGE 🔵",
  "0.000001 ETH FOR A CRUMB? BULLISH 📈",
  "STAY BASED, STAY CRUNCHY 🛡️",
  "DEGEN LEVEL: MAXIMUM CRUNCH 👹",
  "PAPER HANDS CRUMBLE, DIAMOND HANDS CLINK 💎",
  "ONCHAIN IS THE NEW ONLINE 🌐",
  "GO TO BASE, DON'T LOOK BACK 🔵"
];

export default function Home() {
  const { address } = useAccount();
  const [isCracked, setIsCracked] = useState(false);
  const [fortune, setFortune] = useState("");

  const contractAddress = process.env.NEXT_PUBLIC_COOKIEJAR_ADDRESS as `0x${string}`;

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-t from-[#ff71ce] via-[#b967ff] to-[#05ffa1] text-white p-6 font-mono">
      {/* Заголовок в стиле ретро-комикса */}
      <motion.h1 
        initial={{ y: -20 }} animate={{ y: 0 }}
        className="text-4xl font-black mb-12 tracking-tighter border-4 border-black bg-yellow-400 text-black px-4 py-2 rotate-[-2deg] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        style={{ textShadow: '0 2px 2px rgba(0, 0, 0, 0.85)' }}
      >
        BASED COOKIE
      </motion.h1>

      {/* Зона Печенья */}
      <div className="relative flex items-center justify-center h-64">
        <AnimatePresence mode="wait">
          {!isCracked ? (
            <motion.img
              key="whole"
              src="/cookie-whole.png"
              alt="Cookie"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCrack}
              className="w-48 h-48 cursor-pointer object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
              exit={{ scale: 0, opacity: 0, rotate: 180 }}
            />
          ) : (
            <motion.div 
              key="cracked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <img src="/cookie-cracked.png" alt="Cracked" className="w-56 h-56 object-contain" />
              
              {/* Облачко с предсказанием */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 bg-white text-black p-4 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[250px] relative"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white"></div>
                <p className="font-black text-center text-sm uppercase leading-tight">{fortune}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Кнопка транзакции */}
      {isCracked && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-12 w-full max-w-[280px]"
        >
          {address ? (
            <Transaction
              chainId={84532}
              calls={[{ to: contractAddress, abi: contractAbi, functionName: 'claim' }]}
              isSponsored // Спонсирование газа включено
            >
              <TransactionButton className="w-full bg-black text-white border-4 border-white h-16 rounded-none font-black text-xl hover:bg-yellow-400 hover:text-black hover:border-black transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                CLAIM YOUR $ NOW
              </TransactionButton>
              <TransactionStatus>
                <TransactionStatusLabel className="text-center mt-2 text-xs" />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
          ) : (
            <Wallet>
              <div className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <ConnectWallet
                  disconnectedLabel="CONNECT WALLET AND CLAIM YOUR PRIZE"
                  className="w-full bg-transparent text-black font-black border-0 rounded-none hover:bg-yellow-400 transition-all active:shadow-none active:translate-x-1 active:translate-y-1"
                />
              </div>
            </Wallet>
          )}
        </motion.div>
      )}

      {!isCracked && (
        <p className="mt-12 text-blue-200 animate-pulse text-xs uppercase tracking-widest">
          — Click to reveal destiny —
        </p>
      )}
    </div>
  );
}
```

## 
2026-02-09 19:30
 - Bulletproof cookie/bubble animations rewrite

Description: Rewrite cookie/bubble animations with single conditional and no extra loops.

Restore Point: `app/page.tsx`
```tsx
'use client';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion'; // Для крутых анимаций
import { 
  Transaction, 
  TransactionButton, 
  TransactionStatus, 
  TransactionStatusLabel, 
  TransactionStatusAction 
} from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';

const contractAbi = [{ type: 'function', name: 'claim', inputs: [], outputs: [], stateMutability: 'nonpayable' }] as const;

const FORTUNES = [
  "EVERYTHING IS BASED ON @BASE 🔵",
  "ONCHAIN SUMMER NEVER ENDS ☀️",
  "MINT THE COOKIE, HODL THE CRUMB 🍪",
  "BASED AND BLUE-PILLED 🔵",
  "YOUR GAS IS LOW, BUT YOUR VIBE IS HIGH ⛽",
  "EXIT LIQUIDITY? NO, JUST COOKIE LIQUIDITY 🍬",
  "BORN ONCHAIN, RAISED BY DEGENS 👶",
  "WAGMI: WE ARE ALL GONNA MINT COOKIES 🥛",
  "JESSE POLLAK APPROVES THIS MESSAGE 🔵",
  "0.000001 ETH FOR A CRUMB? BULLISH 📈",
  "STAY BASED, STAY CRUNCHY 🛡️",
  "DEGEN LEVEL: MAXIMUM CRUNCH 👹",
  "PAPER HANDS CRUMBLE, DIAMOND HANDS CLINK 💎",
  "ONCHAIN IS THE NEW ONLINE 🌐",
  "GO TO BASE, DON'T LOOK BACK 🔵"
];

export default function Home() {
  const { address } = useAccount();
  const [isCracked, setIsCracked] = useState(false);
  const [fortune, setFortune] = useState("");

  const contractAddress = process.env.NEXT_PUBLIC_COOKIEJAR_ADDRESS as `0x${string}`;

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-t from-[#ff71ce] via-[#b967ff] to-[#05ffa1] text-white p-6 font-mono">
      {/* Заголовок в стиле ретро-комикса */}
      <motion.h1 
        initial={{ y: -20 }} animate={{ y: 0 }}
        className="text-4xl font-black mb-12 tracking-tighter border-4 border-black bg-yellow-400 text-black px-4 py-2 rotate-[-2deg] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        style={{ textShadow: '0 2px 2px rgba(0, 0, 0, 0.85)' }}
      >
        BASED COOKIE
      </motion.h1>

      {/* Зона Печенья */}
      <div className="relative flex items-center justify-center h-64">
        <AnimatePresence mode="wait">
          {!isCracked ? (
            <motion.img
              key="whole"
              src="/cookie-whole.png"
              alt="Cookie"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={{ rotate: [-0.5, 0.5, -0.5], x: [-0.5, 0.5, -0.5] }}
              transition={{ repeat: Infinity, duration: 0.4, ease: 'linear' }}
              onClick={handleCrack}
              className="w-48 h-48 cursor-pointer object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
              exit={{ scale: 0, opacity: 0, rotate: 180 }}
            />
          ) : (
            <motion.div 
              key="cracked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <img src="/cookie-cracked.png" alt="Cracked" className="w-56 h-56 object-contain" />
              
              {/* Облачко с предсказанием */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: [0, -3, 0], rotate: [-0.5, 0.5, -0.5] }}
                transition={{ delay: 0.3, repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="mt-4 bg-white text-black p-4 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[250px] relative"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white"></div>
                <p className="font-black text-center text-sm uppercase leading-tight">{fortune}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Кнопка транзакции */}
      {isCracked && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-12 w-full max-w-[280px]"
        >
          {address ? (
            <Transaction
              chainId={84532}
              calls={[{ to: contractAddress, abi: contractAbi, functionName: 'claim' }]}
              isSponsored // Спонсирование газа включено
            >
              <TransactionButton className="w-full bg-black text-white border-4 border-white h-16 rounded-none font-black text-xl hover:bg-yellow-400 hover:text-black hover:border-black transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                CLAIM YOUR $ NOW
              </TransactionButton>
              <TransactionStatus>
                <TransactionStatusLabel className="text-center mt-2 text-xs" />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
          ) : (
            <Wallet>
              <div className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <ConnectWallet
                  disconnectedLabel="CONNECT WALLET AND CLAIM YOUR PRIZE"
                  className="w-full bg-transparent text-black font-black border-0 rounded-none hover:bg-yellow-400 transition-all active:shadow-none active:translate-x-1 active:translate-y-1"
                />
              </div>
            </Wallet>
          )}
        </motion.div>
      )}

      {!isCracked && (
        <p className="mt-12 text-blue-200 animate-pulse text-xs uppercase tracking-widest">
          — Click to reveal destiny —
        </p>
      )}
    </div>
  );
}
```

## 
2026-02-09 19:33
 - Reset cookie animation logic to stop rotation

Description: Reset cookie/cracked/bubble animation settings; keep shake on whole cookie and remove repeats from cracked/bubble.

Restore Point: `app/page.tsx`
```tsx
'use client';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion'; // Для крутых анимаций
import { 
  Transaction, 
  TransactionButton, 
  TransactionStatus, 
  TransactionStatusLabel, 
  TransactionStatusAction 
} from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';

const contractAbi = [{ type: 'function', name: 'claim', inputs: [], outputs: [], stateMutability: 'nonpayable' }] as const;

const FORTUNES = [
  "EVERYTHING IS BASED ON @BASE 🔵",
  "ONCHAIN SUMMER NEVER ENDS ☀️",
  "MINT THE COOKIE, HODL THE CRUMB 🍪",
  "BASED AND BLUE-PILLED 🔵",
  "YOUR GAS IS LOW, BUT YOUR VIBE IS HIGH ⛽",
  "EXIT LIQUIDITY? NO, JUST COOKIE LIQUIDITY 🍬",
  "BORN ONCHAIN, RAISED BY DEGENS 👶",
  "WAGMI: WE ARE ALL GONNA MINT COOKIES 🥛",
  "JESSE POLLAK APPROVES THIS MESSAGE 🔵",
  "0.000001 ETH FOR A CRUMB? BULLISH 📈",
  "STAY BASED, STAY CRUNCHY 🛡️",
  "DEGEN LEVEL: MAXIMUM CRUNCH 👹",
  "PAPER HANDS CRUMBLE, DIAMOND HANDS CLINK 💎",
  "ONCHAIN IS THE NEW ONLINE 🌐",
  "GO TO BASE, DON'T LOOK BACK 🔵"
];

export default function Home() {
  const { address } = useAccount();
  const [isCracked, setIsCracked] = useState(false);
  const [fortune, setFortune] = useState("");

  const contractAddress = process.env.NEXT_PUBLIC_COOKIEJAR_ADDRESS as `0x${string}`;

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-t from-[#ff71ce] via-[#b967ff] to-[#05ffa1] text-white p-6 font-mono">
      {/* Заголовок в стиле ретро-комикса */}
      <motion.h1 
        initial={{ y: -20 }} animate={{ y: 0 }}
        className="text-4xl font-black mb-12 tracking-tighter border-4 border-black bg-yellow-400 text-black px-4 py-2 rotate-[-2deg] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        style={{ textShadow: '0 2px 2px rgba(0, 0, 0, 0.85)' }}
      >
        BASED COOKIE
      </motion.h1>

      {/* Зона Печенья */}
      <div className="relative flex items-center justify-center h-64">
        <AnimatePresence mode="wait">
          {!isCracked ? (
            <motion.img
              key="whole"
              src="/cookie-whole.png"
              alt="Cookie"
              whileHover={{ scale: 1.1, rotate: 0 }}
              whileTap={{ scale: 0.9 }}
              animate={{ x: [-1, 1, -1], rotate: [-1, 1, -1] }}
              transition={{ repeat: Infinity, duration: 0.2, ease: 'linear' }}
              onClick={handleCrack}
              className="w-48 h-48 cursor-pointer object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
              exit={{ scale: 0, opacity: 0, rotate: 180 }}
            />
          ) : (
            <motion.div 
              key="cracked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <img src="/cookie-cracked.png" alt="Cracked" className="w-56 h-56 object-contain" />
              
              {/* Облачко с предсказанием */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: [0, -5, 0] }}
                transition={{ delay: 0.3, repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="mt-4 bg-white text-black p-4 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[250px] relative"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white"></div>
                <p className="font-black text-center text-sm uppercase leading-tight">{fortune}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Кнопка транзакции */}
      {isCracked && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-12 w-full max-w-[280px]"
        >
          {address ? (
            <Transaction
              chainId={84532}
              calls={[{ to: contractAddress, abi: contractAbi, functionName: 'claim' }]}
              isSponsored // Спонсирование газа включено
            >
              <TransactionButton className="w-full bg-black text-white border-4 border-white h-16 rounded-none font-black text-xl hover:bg-yellow-400 hover:text-black hover:border-black transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                CLAIM YOUR $ NOW
              </TransactionButton>
              <TransactionStatus>
                <TransactionStatusLabel className="text-center mt-2 text-xs" />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
          ) : (
            <Wallet>
              <div className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <ConnectWallet
                  disconnectedLabel="CONNECT WALLET AND CLAIM YOUR PRIZE"
                  className="w-full bg-transparent text-black font-black border-0 rounded-none hover:bg-yellow-400 transition-all active:shadow-none active:translate-x-1 active:translate-y-1"
                />
              </div>
            </Wallet>
          )}
        </motion.div>
      )}

      {!isCracked && (
        <p className="mt-12 text-blue-200 animate-pulse text-xs uppercase tracking-widest">
          — Click to reveal destiny —
        </p>
      )}
    </div>
  );
}
```

## 
2026-02-09 19:38
 - Replace cookie/bubble render block per clean logic

Description: Replace cookie and bubble render block with new AnimatePresence/ordering and updated animations.

Restore Point: `app/page.tsx`
```tsx
'use client';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion'; // Для крутых анимаций
import { 
  Transaction, 
  TransactionButton, 
  TransactionStatus, 
  TransactionStatusLabel, 
  TransactionStatusAction 
} from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';

const contractAbi = [{ type: 'function', name: 'claim', inputs: [], outputs: [], stateMutability: 'nonpayable' }] as const;

const FORTUNES = [
  "EVERYTHING IS BASED ON @BASE 🔵",
  "ONCHAIN SUMMER NEVER ENDS ☀️",
  "MINT THE COOKIE, HODL THE CRUMB 🍪",
  "BASED AND BLUE-PILLED 🔵",
  "YOUR GAS IS LOW, BUT YOUR VIBE IS HIGH ⛽",
  "EXIT LIQUIDITY? NO, JUST COOKIE LIQUIDITY 🍬",
  "BORN ONCHAIN, RAISED BY DEGENS 👶",
  "WAGMI: WE ARE ALL GONNA MINT COOKIES 🥛",
  "JESSE POLLAK APPROVES THIS MESSAGE 🔵",
  "0.000001 ETH FOR A CRUMB? BULLISH 📈",
  "STAY BASED, STAY CRUNCHY 🛡️",
  "DEGEN LEVEL: MAXIMUM CRUNCH 👹",
  "PAPER HANDS CRUMBLE, DIAMOND HANDS CLINK 💎",
  "ONCHAIN IS THE NEW ONLINE 🌐",
  "GO TO BASE, DON'T LOOK BACK 🔵"
];

export default function Home() {
  const { address } = useAccount();
  const [isCracked, setIsCracked] = useState(false);
  const [fortune, setFortune] = useState("");

  const contractAddress = process.env.NEXT_PUBLIC_COOKIEJAR_ADDRESS as `0x${string}`;

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-t from-[#ff71ce] via-[#b967ff] to-[#05ffa1] text-white p-6 font-mono">
      {/* Заголовок в стиле ретро-комикса */}
      <motion.h1 
        initial={{ y: -20 }} animate={{ y: 0 }}
        className="text-4xl font-black mb-12 tracking-tighter border-4 border-black bg-yellow-400 text-black px-4 py-2 rotate-[-2deg] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        style={{ textShadow: '0 2px 2px rgba(0, 0, 0, 0.85)' }}
      >
        BASED COOKIE
      </motion.h1>

      {/* Зона Печенья */}
      <div className="relative flex items-center justify-center h-64">
        <AnimatePresence mode="wait">
          {!isCracked ? (
            <motion.img
              key="whole"
              src="/cookie-whole.png"
              alt="Cookie"
              whileHover={{ scale: 1.1, rotate: 0 }}
              whileTap={{ scale: 0.9 }}
              animate={{ x: [-1, 1, -1], rotate: [-1, 1, -1] }}
              transition={{ repeat: Infinity, duration: 0.2, ease: 'linear' }}
              onClick={handleCrack}
              className="w-48 h-48 cursor-pointer object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
              exit={{ scale: 0, opacity: 0, rotate: 180 }}
            />
          ) : (
            <motion.div 
              key="cracked"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, x: 0, scale: 1, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <img src="/cookie-cracked.png" alt="Cracked" className="w-56 h-56 object-contain" />
              
              {/* Облачко с предсказанием */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 bg-white text-black p-4 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[250px] relative"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white"></div>
                <p className="font-black text-center text-sm uppercase leading-tight">{fortune}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Кнопка транзакции */}
      {isCracked && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-12 w-full max-w-[280px]"
        >
          {address ? (
            <Transaction
              chainId={84532}
              calls={[{ to: contractAddress, abi: contractAbi, functionName: 'claim' }]}
              isSponsored // Спонсирование газа включено
            >
              <TransactionButton className="w-full bg-black text-white border-4 border-white h-16 rounded-none font-black text-xl hover:bg-yellow-400 hover:text-black hover:border-black transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                CLAIM YOUR $ NOW
              </TransactionButton>
              <TransactionStatus>
                <TransactionStatusLabel className="text-center mt-2 text-xs" />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
          ) : (
            <Wallet>
              <div className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <ConnectWallet
                  disconnectedLabel="CONNECT WALLET AND CLAIM YOUR PRIZE"
                  className="w-full bg-transparent text-black font-black border-0 rounded-none hover:bg-yellow-400 transition-all active:shadow-none active:translate-x-1 active:translate-y-1"
                />
              </div>
            </Wallet>
          )}
        </motion.div>
      )}

      {!isCracked && (
        <p className="mt-12 text-blue-200 animate-pulse text-xs uppercase tracking-widest">
          — Click to reveal destiny —
        </p>
      )}
    </div>
  );
}
```

## 
2026-02-09 19:42
 - Adjust cookie render structure and animations per new spec

Description: Update cookie render block with new AnimatePresence structure and animation parameters.

Restore Point: `app/page.tsx`
```tsx
'use client';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion'; // Для крутых анимаций
import { 
  Transaction, 
  TransactionButton, 
  TransactionStatus, 
  TransactionStatusLabel, 
  TransactionStatusAction 
} from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';

const contractAbi = [{ type: 'function', name: 'claim', inputs: [], outputs: [], stateMutability: 'nonpayable' }] as const;

const FORTUNES = [
  "EVERYTHING IS BASED ON @BASE 🔵",
  "ONCHAIN SUMMER NEVER ENDS ☀️",
  "MINT THE COOKIE, HODL THE CRUMB 🍪",
  "BASED AND BLUE-PILLED 🔵",
  "YOUR GAS IS LOW, BUT YOUR VIBE IS HIGH ⛽",
  "EXIT LIQUIDITY? NO, JUST COOKIE LIQUIDITY 🍬",
  "BORN ONCHAIN, RAISED BY DEGENS 👶",
  "WAGMI: WE ARE ALL GONNA MINT COOKIES 🥛",
  "JESSE POLLAK APPROVES THIS MESSAGE 🔵",
  "0.000001 ETH FOR A CRUMB? BULLISH 📈",
  "STAY BASED, STAY CRUNCHY 🛡️",
  "DEGEN LEVEL: MAXIMUM CRUNCH 👹",
  "PAPER HANDS CRUMBLE, DIAMOND HANDS CLINK 💎",
  "ONCHAIN IS THE NEW ONLINE 🌐",
  "GO TO BASE, DON'T LOOK BACK 🔵"
];

export default function Home() {
  const { address } = useAccount();
  const [isCracked, setIsCracked] = useState(false);
  const [fortune, setFortune] = useState("");

  const contractAddress = process.env.NEXT_PUBLIC_COOKIEJAR_ADDRESS as `0x${string}`;

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-t from-[#ff71ce] via-[#b967ff] to-[#05ffa1] text-white p-6 font-mono">
      {/* Заголовок в стиле ретро-комикса */}
      <motion.h1 
        initial={{ y: -20 }} animate={{ y: 0 }}
        className="text-4xl font-black mb-12 tracking-tighter border-4 border-black bg-yellow-400 text-black px-4 py-2 rotate-[-2deg] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        style={{ textShadow: '0 2px 2px rgba(0, 0, 0, 0.85)' }}
      >
        BASED COOKIE
      </motion.h1>

      {/* Зона Печенья */}
      <div className="relative flex items-center justify-center h-64">
        <AnimatePresence mode="wait">
          {!isCracked ? (
            <motion.img
              key="whole"
              src="/cookie-whole.png"
              alt="Cookie"
              whileHover={{ scale: 1.1, rotate: 0 }}
              whileTap={{ scale: 0.9 }}
              animate={{ rotate: [-1, 1, -1], x: [-1, 1, -1] }}
              transition={{ repeat: Infinity, duration: 0.2 }}
              onClick={handleCrack}
              className="w-48 h-48 cursor-pointer object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
              exit={{ opacity: 0, scale: 0, rotate: 0 }}
            />
          ) : (
            <motion.div key="cracked" className="flex flex-col items-center gap-6">
              {/* Облачко с предсказанием */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="mt-4 bg-white text-black p-4 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[250px] relative"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white"></div>
                <p className="font-black text-center text-sm uppercase leading-tight">{fortune}</p>
              </motion.div>

              <motion.img
                src="/cookie-cracked.png"
                alt="Cracked"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.3 }}
                className="w-56 h-56 object-contain"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Кнопка транзакции */}
      {isCracked && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-12 w-full max-w-[280px]"
        >
          {address ? (
            <Transaction
              chainId={84532}
              calls={[{ to: contractAddress, abi: contractAbi, functionName: 'claim' }]}
              isSponsored // Спонсирование газа включено
            >
              <TransactionButton className="w-full bg-black text-white border-4 border-white h-16 rounded-none font-black text-xl hover:bg-yellow-400 hover:text-black hover:border-black transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                CLAIM YOUR $ NOW
              </TransactionButton>
              <TransactionStatus>
                <TransactionStatusLabel className="text-center mt-2 text-xs" />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
          ) : (
            <Wallet>
              <div className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <ConnectWallet
                  disconnectedLabel="CONNECT WALLET AND CLAIM YOUR PRIZE"
                  className="w-full bg-transparent text-black font-black border-0 rounded-none hover:bg-yellow-400 transition-all active:shadow-none active:translate-x-1 active:translate-y-1"
                />
              </div>
            </Wallet>
          )}
        </motion.div>
      )}

      {!isCracked && (
        <p className="mt-12 text-blue-200 animate-pulse text-xs uppercase tracking-widest">
          — Click to reveal destiny —
        </p>
      )}
    </div>
  );
}
```

## 
2026-02-09 19:46
 - Rewrite cookie render block with new keys and bubble layout

Description: Replace cookie/bubble render block per requested structure to prevent rotation.

Restore Point: `app/page.tsx`
```tsx
'use client';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion'; // Для крутых анимаций
import { 
  Transaction, 
  TransactionButton, 
  TransactionStatus, 
  TransactionStatusLabel, 
  TransactionStatusAction 
} from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';

const contractAbi = [{ type: 'function', name: 'claim', inputs: [], outputs: [], stateMutability: 'nonpayable' }] as const;

const FORTUNES = [
  "EVERYTHING IS BASED ON @BASE 🔵",
  "ONCHAIN SUMMER NEVER ENDS ☀️",
  "MINT THE COOKIE, HODL THE CRUMB 🍪",
  "BASED AND BLUE-PILLED 🔵",
  "YOUR GAS IS LOW, BUT YOUR VIBE IS HIGH ⛽",
  "EXIT LIQUIDITY? NO, JUST COOKIE LIQUIDITY 🍬",
  "BORN ONCHAIN, RAISED BY DEGENS 👶",
  "WAGMI: WE ARE ALL GONNA MINT COOKIES 🥛",
  "JESSE POLLAK APPROVES THIS MESSAGE 🔵",
  "0.000001 ETH FOR A CRUMB? BULLISH 📈",
  "STAY BASED, STAY CRUNCHY 🛡️",
  "DEGEN LEVEL: MAXIMUM CRUNCH 👹",
  "PAPER HANDS CRUMBLE, DIAMOND HANDS CLINK 💎",
  "ONCHAIN IS THE NEW ONLINE 🌐",
  "GO TO BASE, DON'T LOOK BACK 🔵"
];

export default function Home() {
  const { address } = useAccount();
  const [isCracked, setIsCracked] = useState(false);
  const [fortune, setFortune] = useState("");

  const contractAddress = process.env.NEXT_PUBLIC_COOKIEJAR_ADDRESS as `0x${string}`;

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-t from-[#ff71ce] via-[#b967ff] to-[#05ffa1] text-white p-6 font-mono">
      {/* Заголовок в стиле ретро-комикса */}
      <motion.h1 
        initial={{ y: -20 }} animate={{ y: 0 }}
        className="text-4xl font-black mb-12 tracking-tighter border-4 border-black bg-yellow-400 text-black px-4 py-2 rotate-[-2deg] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        style={{ textShadow: '0 2px 2px rgba(0, 0, 0, 0.85)' }}
      >
        BASED COOKIE
      </motion.h1>

      {/* Зона Печенья */}
      <div className="relative flex items-center justify-center h-64">
        <AnimatePresence mode="wait">
          {!isCracked ? (
            <motion.img
              key="whole"
              src="/cookie-whole.png"
              alt="Cookie"
              whileHover={{ scale: 1.1, rotate: 0 }}
              whileTap={{ scale: 0.9 }}
              animate={{ rotate: [-1, 1, -1], x: [-1, 1, -1] }}
              transition={{ repeat: Infinity, duration: 0.2, ease: 'linear' }}
              onClick={handleCrack}
              className="w-48 h-48 cursor-pointer object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
              exit={{ opacity: 0, scale: 0 }}
            />
          ) : (
            <motion.div key="cracked" className="flex flex-col items-center gap-4">
              {/* Облачко с предсказанием */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mt-4 bg-white text-black p-4 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[250px] relative"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white"></div>
                <p className="font-black text-center text-sm uppercase leading-tight">{fortune}</p>
              </motion.div>

              <motion.img
                src="/cookie-cracked.png"
                alt="Cracked"
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.1 }}
                className="w-56 h-56 object-contain"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Кнопка транзакции */}
      {isCracked && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-12 w-full max-w-[280px]"
        >
          {address ? (
            <Transaction
              chainId={84532}
              calls={[{ to: contractAddress, abi: contractAbi, functionName: 'claim' }]}
              isSponsored // Спонсирование газа включено
            >
              <TransactionButton className="w-full bg-black text-white border-4 border-white h-16 rounded-none font-black text-xl hover:bg-yellow-400 hover:text-black hover:border-black transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                CLAIM YOUR $ NOW
              </TransactionButton>
              <TransactionStatus>
                <TransactionStatusLabel className="text-center mt-2 text-xs" />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
          ) : (
            <Wallet>
              <div className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <ConnectWallet
                  disconnectedLabel="CONNECT WALLET AND CLAIM YOUR PRIZE"
                  className="w-full bg-transparent text-black font-black border-0 rounded-none hover:bg-yellow-400 transition-all active:shadow-none active:translate-x-1 active:translate-y-1"
                />
              </div>
            </Wallet>
          )}
        </motion.div>
      )}

      {!isCracked && (
        <p className="mt-12 text-blue-200 animate-pulse text-xs uppercase tracking-widest">
          — Click to reveal destiny —
        </p>
      )}
    </div>
  );
}
```

## 
2026-02-09 19:51
 - Rewrite cookie block and button props per new spec

Description: Replace cookie/bubble render logic and update TransactionButton/ConnectWallet text props with !important classes.

Restore Point: `app/page.tsx`
```tsx
'use client';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion'; // Для крутых анимаций
import { 
  Transaction, 
  TransactionButton, 
  TransactionStatus, 
  TransactionStatusLabel, 
  TransactionStatusAction 
} from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';

const contractAbi = [{ type: 'function', name: 'claim', inputs: [], outputs: [], stateMutability: 'nonpayable' }] as const;

const FORTUNES = [
  "EVERYTHING IS BASED ON @BASE 🔵",
  "ONCHAIN SUMMER NEVER ENDS ☀️",
  "MINT THE COOKIE, HODL THE CRUMB 🍪",
  "BASED AND BLUE-PILLED 🔵",
  "YOUR GAS IS LOW, BUT YOUR VIBE IS HIGH ⛽",
  "EXIT LIQUIDITY? NO, JUST COOKIE LIQUIDITY 🍬",
  "BORN ONCHAIN, RAISED BY DEGENS 👶",
  "WAGMI: WE ARE ALL GONNA MINT COOKIES 🥛",
  "JESSE POLLAK APPROVES THIS MESSAGE 🔵",
  "0.000001 ETH FOR A CRUMB? BULLISH 📈",
  "STAY BASED, STAY CRUNCHY 🛡️",
  "DEGEN LEVEL: MAXIMUM CRUNCH 👹",
  "PAPER HANDS CRUMBLE, DIAMOND HANDS CLINK 💎",
  "ONCHAIN IS THE NEW ONLINE 🌐",
  "GO TO BASE, DON'T LOOK BACK 🔵"
];

export default function Home() {
  const { address } = useAccount();
  const [isCracked, setIsCracked] = useState(false);
  const [fortune, setFortune] = useState("");

  const contractAddress = process.env.NEXT_PUBLIC_COOKIEJAR_ADDRESS as `0x${string}`;

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-t from-[#ff71ce] via-[#b967ff] to-[#05ffa1] text-white p-6 font-mono">
      {/* Заголовок в стиле ретро-комикса */}
      <motion.h1 
        initial={{ y: -20 }} animate={{ y: 0 }}
        className="text-4xl font-black mb-12 tracking-tighter border-4 border-black bg-yellow-400 text-black px-4 py-2 rotate-[-2deg] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        style={{ textShadow: '0 2px 2px rgba(0, 0, 0, 0.85)' }}
      >
        BASED COOKIE
      </motion.h1>

      {/* Зона Печенья */}
      <div className="relative flex items-center justify-center h-64">
        <AnimatePresence mode="wait">
          {!isCracked ? (
            <motion.img
              key="cookie-whole"
              src="/cookie-whole.png"
              alt="Cookie"
              whileHover={{ scale: 1.1, rotate: 0 }}
              whileTap={{ scale: 0.9 }}
              animate={{ rotate: [-1, 1, -1], x: [-1, 1, -1] }}
              transition={{ repeat: Infinity, duration: 0.2, ease: 'linear' }}
              onClick={handleCrack}
              className="w-48 h-48 cursor-pointer object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
              exit={{ opacity: 0, scale: 0, rotate: 0 }}
            />
          ) : (
            <motion.div
              key="cookie-cracked-container"
              className="flex flex-col items-center gap-8"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              >
                <p className="font-black text-center text-sm uppercase leading-tight">{fortune}</p>
              </motion.div>

              <motion.img
                src="/cookie-cracked.png"
                alt="Cracked"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.3 }}
                className="w-56 h-56 object-contain"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Кнопка транзакции */}
      {isCracked && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-12 w-full max-w-[280px]"
        >
          {address ? (
            <Transaction
              chainId={84532}
              calls={[{ to: contractAddress, abi: contractAbi, functionName: 'claim' }]}
              isSponsored // Спонсирование газа включено
            >
              <TransactionButton className="w-full bg-black text-white border-4 border-white h-16 rounded-none font-black text-xl hover:bg-yellow-400 hover:text-black hover:border-black transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                CLAIM YOUR $ NOW
              </TransactionButton>
              <TransactionStatus>
                <TransactionStatusLabel className="text-center mt-2 text-xs" />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
          ) : (
            <Wallet>
              <div className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <ConnectWallet
                  disconnectedLabel="CONNECT WALLET AND CLAIM YOUR PRIZE"
                  className="w-full bg-transparent text-black font-black border-0 rounded-none hover:bg-yellow-400 transition-all active:shadow-none active:translate-x-1 active:translate-y-1"
                />
              </div>
            </Wallet>
          )}
        </motion.div>
      )}

      {!isCracked && (
        <p className="mt-12 text-blue-200 animate-pulse text-xs uppercase tracking-widest">
          — Click to reveal destiny —
        </p>
      )}
    </div>
  );
}
```

## 
2026-02-09 19:58
 - Align cookie/bubble transitions with requested spec

Description: Adjust cookie/bubble transitions to match spec; keep TS-safe props.

Restore Point: `app/page.tsx`
```tsx
'use client';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion'; // Для крутых анимаций
import { 
  Transaction, 
  TransactionButton, 
  TransactionStatus, 
  TransactionStatusLabel, 
  TransactionStatusAction 
} from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';

const contractAbi = [{ type: 'function', name: 'claim', inputs: [], outputs: [], stateMutability: 'nonpayable' }] as const;

const FORTUNES = [
  "EVERYTHING IS BASED ON @BASE 🔵",
  "ONCHAIN SUMMER NEVER ENDS ☀️",
  "MINT THE COOKIE, HODL THE CRUMB 🍪",
  "BASED AND BLUE-PILLED 🔵",
  "YOUR GAS IS LOW, BUT YOUR VIBE IS HIGH ⛽",
  "EXIT LIQUIDITY? NO, JUST COOKIE LIQUIDITY 🍬",
  "BORN ONCHAIN, RAISED BY DEGENS 👶",
  "WAGMI: WE ARE ALL GONNA MINT COOKIES 🥛",
  "JESSE POLLAK APPROVES THIS MESSAGE 🔵",
  "0.000001 ETH FOR A CRUMB? BULLISH 📈",
  "STAY BASED, STAY CRUNCHY 🛡️",
  "DEGEN LEVEL: MAXIMUM CRUNCH 👹",
  "PAPER HANDS CRUMBLE, DIAMOND HANDS CLINK 💎",
  "ONCHAIN IS THE NEW ONLINE 🌐",
  "GO TO BASE, DON'T LOOK BACK 🔵"
];

export default function Home() {
  const { address } = useAccount();
  const [isCracked, setIsCracked] = useState(false);
  const [fortune, setFortune] = useState("");

  const contractAddress = process.env.NEXT_PUBLIC_COOKIEJAR_ADDRESS as `0x${string}`;

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-t from-[#ff71ce] via-[#b967ff] to-[#05ffa1] text-white p-6 font-mono">
      {/* Заголовок в стиле ретро-комикса */}
      <motion.h1 
        initial={{ y: -20 }} animate={{ y: 0 }}
        className="text-4xl font-black mb-12 tracking-tighter border-4 border-black bg-yellow-400 text-black px-4 py-2 rotate-[-2deg] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        style={{ textShadow: '0 2px 2px rgba(0, 0, 0, 0.85)' }}
      >
        BASED COOKIE
      </motion.h1>

      {/* Зона Печенья */}
      <div className="relative flex items-center justify-center h-64">
        <AnimatePresence mode="wait">
          {!isCracked ? (
            <motion.img
              key="whole"
              src="/cookie-whole.png"
              alt="Cookie"
              whileHover={{ scale: 1.1, rotate: 0 }}
              whileTap={{ scale: 0.9 }}
              animate={{ rotate: [-1, 1, -1], x: [-1, 1, -1] }}
              transition={{ repeat: Infinity, duration: 0.2, ease: 'linear' }}
              onClick={handleCrack}
              className="w-48 h-48 cursor-pointer object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
              exit={{ opacity: 0, scale: 0, rotate: 0 }}
            />
          ) : (
            <motion.div
              key="cracked-container"
              className="flex flex-col items-center gap-6"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              >
                <p className="font-black text-center text-sm uppercase leading-tight">{fortune}</p>
              </motion.div>

              <img
                src="/cookie-cracked.png"
                alt="Cracked"
                className="w-56 h-56 object-contain"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Кнопка транзакции */}
      {isCracked && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-12 w-full max-w-[280px]"
        >
          {address ? (
            <Transaction
              chainId={84532}
              calls={[{ to: contractAddress, abi: contractAbi, functionName: 'claim' }]}
              isSponsored // Спонсирование газа включено
            >
              <TransactionButton
                text="CLAIM YOUR $ NOW"
                className="w-full !bg-black !text-white !border-4 !border-white h-16 !rounded-none font-black text-xl hover:!bg-yellow-400 hover:!text-black hover:!border-black transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
              />
              <TransactionStatus>
                <TransactionStatusLabel className="text-center mt-2 text-xs" />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
          ) : (
            <Wallet>
              <div className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <ConnectWallet
                  disconnectedLabel="CONNECT WALLET AND CLAIM YOUR PRIZE"
                  className="w-full !bg-white !text-black font-black !border-0 !rounded-none hover:!bg-yellow-400 transition-all active:shadow-none active:translate-x-1 active:translate-y-1"
                />
              </div>
            </Wallet>
          )}
        </motion.div>
      )}

      {!isCracked && (
        <p className="mt-12 text-blue-200 animate-pulse text-xs uppercase tracking-widest">
          — Click to reveal destiny —
        </p>
      )}
    </div>
  );
}
```

## 
2026-02-09 20:03
 - Pre-rollback snapshot

Description: Snapshot before rollback to 2026-02-09 19:25 stable baseline.

Restore Point: `app/page.tsx`
```tsx
'use client';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion'; // Для крутых анимаций
import { 
  Transaction, 
  TransactionButton, 
  TransactionStatus, 
  TransactionStatusLabel, 
  TransactionStatusAction 
} from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';

const contractAbi = [{ type: 'function', name: 'claim', inputs: [], outputs: [], stateMutability: 'nonpayable' }] as const;

const FORTUNES = [
  "EVERYTHING IS BASED ON @BASE 🔵",
  "ONCHAIN SUMMER NEVER ENDS ☀️",
  "MINT THE COOKIE, HODL THE CRUMB 🍪",
  "BASED AND BLUE-PILLED 🔵",
  "YOUR GAS IS LOW, BUT YOUR VIBE IS HIGH ⛽",
  "EXIT LIQUIDITY? NO, JUST COOKIE LIQUIDITY 🍬",
  "BORN ONCHAIN, RAISED BY DEGENS 👶",
  "WAGMI: WE ARE ALL GONNA MINT COOKIES 🥛",
  "JESSE POLLAK APPROVES THIS MESSAGE 🔵",
  "0.000001 ETH FOR A CRUMB? BULLISH 📈",
  "STAY BASED, STAY CRUNCHY 🛡️",
  "DEGEN LEVEL: MAXIMUM CRUNCH 👹",
  "PAPER HANDS CRUMBLE, DIAMOND HANDS CLINK 💎",
  "ONCHAIN IS THE NEW ONLINE 🌐",
  "GO TO BASE, DON'T LOOK BACK 🔵"
];

export default function Home() {
  const { address } = useAccount();
  const [isCracked, setIsCracked] = useState(false);
  const [fortune, setFortune] = useState("");

  const contractAddress = process.env.NEXT_PUBLIC_COOKIEJAR_ADDRESS as `0x${string}`;

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-t from-[#ff71ce] via-[#b967ff] to-[#05ffa1] text-white p-6 font-mono">
      {/* Заголовок в стиле ретро-комикса */}
      <motion.h1 
        initial={{ y: -20 }} animate={{ y: 0 }}
        className="text-4xl font-black mb-12 tracking-tighter border-4 border-black bg-yellow-400 text-black px-4 py-2 rotate-[-2deg] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        style={{ textShadow: '0 2px 2px rgba(0, 0, 0, 0.85)' }}
      >
        BASED COOKIE
      </motion.h1>

      {/* Зона Печенья */}
      <div className="relative flex items-center justify-center h-64">
        <AnimatePresence mode="wait">
          {!isCracked ? (
            <motion.img
              key="whole"
              src="/cookie-whole.png"
              alt="Cookie"
              whileHover={{ scale: 1.1, rotate: 0 }}
              whileTap={{ scale: 0.9 }}
              animate={{ rotate: [-1, 1, -1], x: [-1, 1, -1] }}
              transition={{ repeat: Infinity, duration: 0.2 }}
              onClick={handleCrack}
              className="w-48 h-48 cursor-pointer object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
              exit={{ opacity: 0, scale: 0, rotate: 0 }}
            />
          ) : (
            <motion.div
              key="cracked-container"
              className="flex flex-col items-center gap-6"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              >
                <p className="font-black text-center text-sm uppercase leading-tight">{fortune}</p>
              </motion.div>

              <img
                src="/cookie-cracked.png"
                alt="Cracked"
                className="w-56 h-56 object-contain"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Кнопка транзакции */}
      {isCracked && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-12 w-full max-w-[280px]"
        >
          {address ? (
            <Transaction
              chainId={84532}
              calls={[{ to: contractAddress, abi: contractAbi, functionName: 'claim' }]}
              isSponsored // Спонсирование газа включено
            >
              <TransactionButton
                text="CLAIM YOUR $ NOW"
                className="w-full !bg-black !text-white !border-4 !border-white h-16 !rounded-none font-black text-xl hover:!bg-yellow-400 hover:!text-black hover:!border-black transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
              />
              <TransactionStatus>
                <TransactionStatusLabel className="text-center mt-2 text-xs" />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
          ) : (
            <Wallet>
              <div className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <ConnectWallet
                  disconnectedLabel="CONNECT WALLET AND CLAIM YOUR PRIZE"
                  className="w-full !bg-white !text-black font-black !border-0 !rounded-none hover:!bg-yellow-400 transition-all active:shadow-none active:translate-x-1 active:translate-y-1"
                />
              </div>
            </Wallet>
          )}
        </motion.div>
      )}

      {!isCracked && (
        <p className="mt-12 text-blue-200 animate-pulse text-xs uppercase tracking-widest">
          — Click to reveal destiny —
        </p>
      )}
    </div>
  );
}
```

## 
2026-02-09 20:20
 - Fix unicode escapes and ConnectWallet styles

Description: Replace emoji text with unicode escapes, update ConnectWallet styling, and ensure UTF-8 meta.

Restore Point: `app/page.tsx`
```tsx
'use client';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion'; // Для крутых анимаций
import { 
  Transaction, 
  TransactionButton, 
  TransactionStatus, 
  TransactionStatusLabel, 
  TransactionStatusAction 
} from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';

const contractAbi = [{ type: 'function', name: 'claim', inputs: [], outputs: [], stateMutability: 'nonpayable' }] as const;

const FORTUNES = [
  "EVERYTHING IS BASED ON @BASE PUMP ??",
  "ONCHAIN SUMMER NEVER ENDS ☀️",
  "MINT THE COOKIE, HODL THE CRUMB 🍪",
  "BASED AND BLUE-PILLED 🔵",
  "YOUR GAS IS LOW, BUT YOUR VIBE IS HIGH ⛽",
  "EXIT LIQUIDITY? NO, JUST COOKIE LIQUIDITY 🍬",
  "BORN ONCHAIN, RAISED BY DEGENS 👶",
  "WAGMI: WE ARE ALL GONNA MINT COOKIES 🥛",
  "JESSE POLLAK APPROVES THIS MESSAGE 🔵",
  "0.000001 ETH FOR A CRUMB? BULLISH 📈",
  "STAY BASED, STAY CRUNCHY 🛡️",
  "DEGEN LEVEL: MAXIMUM CRUNCH 👹",
  "PAPER HANDS CRUMBLE, DIAMOND HANDS CLINK 💎",
  "ONCHAIN IS THE NEW ONLINE 🌐",
  "GO TO BASE, DON'T LOOK BACK 🔵"
];

export default function Home() {
  const { address } = useAccount();
  const [isCracked, setIsCracked] = useState(false);
  const [fortune, setFortune] = useState("");

  const contractAddress = process.env.NEXT_PUBLIC_COOKIEJAR_ADDRESS as `0x${string}`;

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-t from-[#ff71ce] via-[#b967ff] to-[#05ffa1] text-white p-6 font-mono">
      {/* Заголовок в стиле ретро-комикса */}
      <motion.h1 
        initial={{ y: -20 }} animate={{ y: 0 }}
        className="text-4xl font-black mb-12 tracking-tighter border-4 border-black bg-yellow-400 text-black px-4 py-2 rotate-[-2deg] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        style={{ textShadow: '0 2px 2px rgba(0, 0, 0, 0.85)' }}
      >
        BASED COOKIE
      </motion.h1>

      {/* Зона Печенья */}
      <div className="relative flex items-center justify-center h-64">
        <AnimatePresence mode="wait">
          {!isCracked ? (
            <motion.img
              key="whole"
              src="/cookie-whole.png"
              alt="Cookie"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCrack}
              className="w-48 h-48 cursor-pointer object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
              exit={{ scale: 0, opacity: 0, rotate: 180 }}
            />
          ) : (
            <motion.div 
              key="cracked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <img src="/cookie-cracked.png" alt="Cracked" className="w-56 h-56 object-contain" />
              
              {/* Облачко с предсказанием */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 bg-white text-black p-4 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[250px] relative"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white"></div>
                <p className="font-black text-center text-sm uppercase leading-tight">{fortune}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Кнопка транзакции */}
      {isCracked && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-12 w-full max-w-[280px]"
        >
          {address ? (
            <Transaction
              chainId={84532}
              calls={[{ to: contractAddress, abi: contractAbi, functionName: 'claim' }]}
              isSponsored // Спонсирование газа включено
            >
              <TransactionButton className="w-full bg-black text-white border-4 border-white h-16 rounded-none font-black text-xl hover:bg-yellow-400 hover:text-black hover:border-black transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                CLAIM YOUR $ NOW
              </TransactionButton>
              <TransactionStatus>
                <TransactionStatusLabel className="text-center mt-2 text-xs" />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
          ) : (
            <Wallet>
              <div className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <ConnectWallet
                  disconnectedLabel="CONNECT WALLET AND CLAIM YOUR PRIZE"
                  className="w-full bg-transparent text-black font-black rounded-none hover:bg-yellow-400 transition-all active:translate-x-1 active:translate-y-1 !border-none !shadow-none !outline-none"
                />
              </div>
            </Wallet>
          )}
        </motion.div>
      )}

      {!isCracked && (
        <p className="mt-12 text-blue-200 animate-pulse text-xs uppercase tracking-widest">
          — Click to reveal destiny —
        </p>
      )}
    </div>
  );
}

```

## 
2026-02-09 20:23
 - Replace emoji literals with unicode escapes

Description: Rewrite FORTUNES and text constants to use unicode escapes for emoji stability.

Restore Point: `app/page.tsx`
```tsx
'use client';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion'; // Для крутых анимаций
import { 
  Transaction, 
  TransactionButton, 
  TransactionStatus, 
  TransactionStatusLabel, 
  TransactionStatusAction 
} from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';

const contractAbi = [{ type: 'function', name: 'claim', inputs: [], outputs: [], stateMutability: 'nonpayable' }] as const;

const FORTUNES = [
  "EVERYTHING IS BASED ON @BASE PUMP \u{1F680}",
  "ONCHAIN SUMMER NEVER ENDS ☀️",
  "MINT THE COOKIE, HODL THE CRUMB 🍪",
  "BASED AND BLUE-PILLED 🔵",
  "YOUR GAS IS LOW, BUT YOUR VIBE IS HIGH \u{2728}",
  "EXIT LIQUIDITY? NO, JUST COOKIE LIQUIDITY 🍬",
  "BORN ONCHAIN, RAISED BY DEGENS 👶",
  "WAGMI: WE ARE ALL GONNA MINT COOKIES 🥛",
  "JESSE POLLAK APPROVES THIS MESSAGE 🔵",
  "0.000001 ETH FOR A CRUMB? BULLISH 📈",
  "STAY BASED, STAY CRUNCHY 🛡️",
  "DEGEN LEVEL: MAXIMUM CRUNCH 👹",
  "PAPER HANDS CRUMBLE, DIAMOND HANDS CLINK 💎",
  "ONCHAIN IS THE NEW ONLINE 🌐",
  "GO TO BASE, DON'T LOOK BACK 🔵"
];

export default function Home() {
  const { address } = useAccount();
  const [isCracked, setIsCracked] = useState(false);
  const [fortune, setFortune] = useState("");

  const contractAddress = process.env.NEXT_PUBLIC_COOKIEJAR_ADDRESS as `0x${string}`;

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-t from-[#ff71ce] via-[#b967ff] to-[#05ffa1] text-white p-6 font-mono">
      {/* Заголовок в стиле ретро-комикса */}
      <motion.h1 
        initial={{ y: -20 }} animate={{ y: 0 }}
        className="text-4xl font-black mb-12 tracking-tighter border-4 border-black bg-yellow-400 text-black px-4 py-2 rotate-[-2deg] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        style={{ textShadow: '0 2px 2px rgba(0, 0, 0, 0.85)' }}
      >
        BASED COOKIE
      </motion.h1>

      {/* Зона Печенья */}
      <div className="relative flex items-center justify-center h-64">
        <AnimatePresence mode="wait">
          {!isCracked ? (
            <motion.img
              key="whole"
              src="/cookie-whole.png"
              alt="Cookie"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCrack}
              className="w-48 h-48 cursor-pointer object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
              exit={{ scale: 0, opacity: 0, rotate: 180 }}
            />
          ) : (
            <motion.div 
              key="cracked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <img src="/cookie-cracked.png" alt="Cracked" className="w-56 h-56 object-contain" />
              
              {/* Облачко с предсказанием */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 bg-white text-black p-4 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[250px] relative"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white"></div>
                <p className="font-black text-center text-sm uppercase leading-tight">{fortune}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Кнопка транзакции */}
      {isCracked && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-12 w-full max-w-[280px]"
        >
          {address ? (
            <Transaction
              chainId={84532}
              calls={[{ to: contractAddress, abi: contractAbi, functionName: 'claim' }]}
              isSponsored // Спонсирование газа включено
            >
              <TransactionButton className="w-full bg-black text-white border-4 border-white h-16 rounded-none font-black text-xl hover:bg-yellow-400 hover:text-black hover:border-black transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                CLAIM YOUR $ NOW
              </TransactionButton>
              <TransactionStatus>
                <TransactionStatusLabel className="text-center mt-2 text-xs" />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
          ) : (
            <Wallet>
              <ConnectWallet
                disconnectedLabel="CONNECT WALLET AND CLAIM YOUR PRIZE"
                className="!bg-[#7c89ff] !text-white !font-bold !border-none !shadow-none !outline-none !ring-0 rounded-xl hover:opacity-90 transition-all"
              />
            </Wallet>
          )}
        </motion.div>
      )}

      {!isCracked && (
        <p className="mt-12 text-blue-200 animate-pulse text-xs uppercase tracking-widest">
          {"\u{1F36A} CLICK TO REVEAL DESTINY \u{1F36A}"}
        </p>
      )}
    </div>
  );
}


```

## 
2026-02-09 20:29
 - Add fortune bubble rocking animation

Description: Add subtle y/rotate rocking animation to the fortune bubble.

Restore Point: `app/page.tsx`
```tsx
'use client';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion'; // Для крутых анимаций
import { 
  Transaction, 
  TransactionButton, 
  TransactionStatus, 
  TransactionStatusLabel, 
  TransactionStatusAction 
} from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';

const contractAbi = [{ type: 'function', name: 'claim', inputs: [], outputs: [], stateMutability: 'nonpayable' }] as const;

const FORTUNES = [
  "EVERYTHING IS BASED ON @BASE PUMP \u{1F680}",
  "ONCHAIN SUMMER NEVER ENDS \u{2600}\u{FE0F}",
  "MINT THE COOKIE, HODL THE CRUMB \u{1F36A}",
  "BASED AND BLUE-PILLED \u{1F535}",
  "YOUR GAS IS LOW, BUT YOUR VIBE IS HIGH \u{2728}",
  "EXIT LIQUIDITY? NO, JUST COOKIE LIQUIDITY \u{1F36C}",
  "BORN ONCHAIN, RAISED BY DEGENS \u{1F476}",
  "WAGMI: WE ARE ALL GONNA MINT COOKIES \u{1F95B}",
  "JESSE POLLAK APPROVES THIS MESSAGE \u{1F535}",
  "0.000001 ETH FOR A CRUMB? BULLISH \u{1F4C8}",
  "STAY BASED, STAY CRUNCHY \u{1F6E1}\u{FE0F}",
  "DEGEN LEVEL: MAXIMUM CRUNCH \u{1F479}",
  "PAPER HANDS CRUMBLE, DIAMOND HANDS CLINK \u{1F48E}",
  "ONCHAIN IS THE NEW ONLINE \u{1F310}",
  "GO TO BASE, DON'T LOOK BACK \u{1F535}"
];

export default function Home() {
  const { address } = useAccount();
  const [isCracked, setIsCracked] = useState(false);
  const [fortune, setFortune] = useState("");

  const contractAddress = process.env.NEXT_PUBLIC_COOKIEJAR_ADDRESS as `0x${string}`;

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-t from-[#ff71ce] via-[#b967ff] to-[#05ffa1] text-white p-6 font-mono">
      {/* Заголовок в стиле ретро-комикса */}
      <motion.h1 
        initial={{ y: -20 }} animate={{ y: 0 }}
        className="text-4xl font-black mb-12 tracking-tighter border-4 border-black bg-yellow-400 text-black px-4 py-2 rotate-[-2deg] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        style={{ textShadow: '0 2px 2px rgba(0, 0, 0, 0.85)' }}
      >
        BASED COOKIE
      </motion.h1>

      {/* Зона Печенья */}
      <div className="relative flex items-center justify-center h-64">
        <AnimatePresence mode="wait">
          {!isCracked ? (
            <motion.img
              key="whole"
              src="/cookie-whole.png"
              alt="Cookie"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCrack}
              className="w-48 h-48 cursor-pointer object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
              exit={{ scale: 0, opacity: 0, rotate: 180 }}
            />
          ) : (
            <motion.div 
              key="cracked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <img src="/cookie-cracked.png" alt="Cracked" className="w-56 h-56 object-contain" />
              
              {/* Облачко с предсказанием */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 bg-white text-black p-4 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[250px] relative"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white"></div>
                <p className="font-black text-center text-sm uppercase leading-tight">{fortune}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Кнопка транзакции */}
      {isCracked && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-12 w-full max-w-[280px]"
        >
          {address ? (
            <Transaction
              chainId={84532}
              calls={[{ to: contractAddress, abi: contractAbi, functionName: 'claim' }]}
              isSponsored // Спонсирование газа включено
            >
              <TransactionButton className="w-full bg-black text-white border-4 border-white h-16 rounded-none font-black text-xl hover:bg-yellow-400 hover:text-black hover:border-black transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                CLAIM YOUR $ NOW
              </TransactionButton>
              <TransactionStatus>
                <TransactionStatusLabel className="text-center mt-2 text-xs" />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
          ) : (
            <Wallet>
              <ConnectWallet
                disconnectedLabel="CONNECT WALLET AND CLAIM YOUR PRIZE"
                className="!bg-[#7c89ff] !text-white !font-bold !border-none !shadow-none !outline-none !ring-0 rounded-xl hover:opacity-90 transition-all"
              />
            </Wallet>
          )}
        </motion.div>
      )}

      {!isCracked && (
        <p className="mt-12 text-blue-200 animate-pulse text-xs uppercase tracking-widest">
          {"\u{1F36A} CLICK TO REVEAL DESTINY \u{1F36A}"}
        </p>
      )}
    </div>
  );
}



```

## 
2026-02-09 20:31
 - Fortune bubble rocks without fade

Description: Remove fade-in from fortune bubble; keep rocking animation only.

Restore Point: `app/page.tsx`
```tsx
'use client';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion'; // Для крутых анимаций
import { 
  Transaction, 
  TransactionButton, 
  TransactionStatus, 
  TransactionStatusLabel, 
  TransactionStatusAction 
} from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';

const contractAbi = [{ type: 'function', name: 'claim', inputs: [], outputs: [], stateMutability: 'nonpayable' }] as const;

const FORTUNES = [
  "EVERYTHING IS BASED ON @BASE PUMP \u{1F680}",
  "ONCHAIN SUMMER NEVER ENDS \u{2600}\u{FE0F}",
  "MINT THE COOKIE, HODL THE CRUMB \u{1F36A}",
  "BASED AND BLUE-PILLED \u{1F535}",
  "YOUR GAS IS LOW, BUT YOUR VIBE IS HIGH \u{2728}",
  "EXIT LIQUIDITY? NO, JUST COOKIE LIQUIDITY \u{1F36C}",
  "BORN ONCHAIN, RAISED BY DEGENS \u{1F476}",
  "WAGMI: WE ARE ALL GONNA MINT COOKIES \u{1F95B}",
  "JESSE POLLAK APPROVES THIS MESSAGE \u{1F535}",
  "0.000001 ETH FOR A CRUMB? BULLISH \u{1F4C8}",
  "STAY BASED, STAY CRUNCHY \u{1F6E1}\u{FE0F}",
  "DEGEN LEVEL: MAXIMUM CRUNCH \u{1F479}",
  "PAPER HANDS CRUMBLE, DIAMOND HANDS CLINK \u{1F48E}",
  "ONCHAIN IS THE NEW ONLINE \u{1F310}",
  "GO TO BASE, DON'T LOOK BACK \u{1F535}"
];

export default function Home() {
  const { address } = useAccount();
  const [isCracked, setIsCracked] = useState(false);
  const [fortune, setFortune] = useState("");

  const contractAddress = process.env.NEXT_PUBLIC_COOKIEJAR_ADDRESS as `0x${string}`;

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-t from-[#ff71ce] via-[#b967ff] to-[#05ffa1] text-white p-6 font-mono">
      {/* Заголовок в стиле ретро-комикса */}
      <motion.h1 
        initial={{ y: -20 }} animate={{ y: 0 }}
        className="text-4xl font-black mb-12 tracking-tighter border-4 border-black bg-yellow-400 text-black px-4 py-2 rotate-[-2deg] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        style={{ textShadow: '0 2px 2px rgba(0, 0, 0, 0.85)' }}
      >
        BASED COOKIE
      </motion.h1>

      {/* Зона Печенья */}
      <div className="relative flex items-center justify-center h-64">
        <AnimatePresence mode="wait">
          {!isCracked ? (
            <motion.img
              key="whole"
              src="/cookie-whole.png"
              alt="Cookie"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCrack}
              className="w-48 h-48 cursor-pointer object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
              exit={{ scale: 0, opacity: 0, rotate: 180 }}
            />
          ) : (
            <motion.div 
              key="cracked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <img src="/cookie-cracked.png" alt="Cracked" className="w-56 h-56 object-contain" />
              
              {/* Облачко с предсказанием */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: [0, -10, 0], rotate: [-1, 1, -1] }}
                transition={{ delay: 0.3, duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="mt-4 bg-white text-black p-4 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[250px] relative"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white"></div>
                <p className="font-black text-center text-sm uppercase leading-tight">{fortune}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Кнопка транзакции */}
      {isCracked && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-12 w-full max-w-[280px]"
        >
          {address ? (
            <Transaction
              chainId={84532}
              calls={[{ to: contractAddress, abi: contractAbi, functionName: 'claim' }]}
              isSponsored // Спонсирование газа включено
            >
              <TransactionButton className="w-full bg-black text-white border-4 border-white h-16 rounded-none font-black text-xl hover:bg-yellow-400 hover:text-black hover:border-black transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                CLAIM YOUR $ NOW
              </TransactionButton>
              <TransactionStatus>
                <TransactionStatusLabel className="text-center mt-2 text-xs" />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
          ) : (
            <Wallet>
              <ConnectWallet
                disconnectedLabel="CONNECT WALLET AND CLAIM YOUR PRIZE"
                className="!bg-[#7c89ff] !text-white !font-bold !border-none !shadow-none !outline-none !ring-0 rounded-xl hover:opacity-90 transition-all"
              />
            </Wallet>
          )}
        </motion.div>
      )}

      {!isCracked && (
        <p className="mt-12 text-blue-200 animate-pulse text-xs uppercase tracking-widest">
          {"\u{1F36A} CLICK TO REVEAL DESTINY \u{1F36A}"}
        </p>
      )}
    </div>
  );
}



```

## 
2026-02-09 20:34
 - Add ConnectWallet pressed-border classes

Description: Add !border-b and active press styles to ConnectWallet className.

Restore Point: `app/page.tsx`
```tsx
'use client';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion'; // Для крутых анимаций
import { 
  Transaction, 
  TransactionButton, 
  TransactionStatus, 
  TransactionStatusLabel, 
  TransactionStatusAction 
} from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';

const contractAbi = [{ type: 'function', name: 'claim', inputs: [], outputs: [], stateMutability: 'nonpayable' }] as const;

const FORTUNES = [
  "EVERYTHING IS BASED ON @BASE PUMP \u{1F680}",
  "ONCHAIN SUMMER NEVER ENDS \u{2600}\u{FE0F}",
  "MINT THE COOKIE, HODL THE CRUMB \u{1F36A}",
  "BASED AND BLUE-PILLED \u{1F535}",
  "YOUR GAS IS LOW, BUT YOUR VIBE IS HIGH \u{2728}",
  "EXIT LIQUIDITY? NO, JUST COOKIE LIQUIDITY \u{1F36C}",
  "BORN ONCHAIN, RAISED BY DEGENS \u{1F476}",
  "WAGMI: WE ARE ALL GONNA MINT COOKIES \u{1F95B}",
  "JESSE POLLAK APPROVES THIS MESSAGE \u{1F535}",
  "0.000001 ETH FOR A CRUMB? BULLISH \u{1F4C8}",
  "STAY BASED, STAY CRUNCHY \u{1F6E1}\u{FE0F}",
  "DEGEN LEVEL: MAXIMUM CRUNCH \u{1F479}",
  "PAPER HANDS CRUMBLE, DIAMOND HANDS CLINK \u{1F48E}",
  "ONCHAIN IS THE NEW ONLINE \u{1F310}",
  "GO TO BASE, DON'T LOOK BACK \u{1F535}"
];

export default function Home() {
  const { address } = useAccount();
  const [isCracked, setIsCracked] = useState(false);
  const [fortune, setFortune] = useState("");

  const contractAddress = process.env.NEXT_PUBLIC_COOKIEJAR_ADDRESS as `0x${string}`;

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-t from-[#ff71ce] via-[#b967ff] to-[#05ffa1] text-white p-6 font-mono">
      {/* Заголовок в стиле ретро-комикса */}
      <motion.h1 
        initial={{ y: -20 }} animate={{ y: 0 }}
        className="text-4xl font-black mb-12 tracking-tighter border-4 border-black bg-yellow-400 text-black px-4 py-2 rotate-[-2deg] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        style={{ textShadow: '0 2px 2px rgba(0, 0, 0, 0.85)' }}
      >
        BASED COOKIE
      </motion.h1>

      {/* Зона Печенья */}
      <div className="relative flex items-center justify-center h-64">
        <AnimatePresence mode="wait">
          {!isCracked ? (
            <motion.img
              key="whole"
              src="/cookie-whole.png"
              alt="Cookie"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCrack}
              className="w-48 h-48 cursor-pointer object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
              exit={{ scale: 0, opacity: 0, rotate: 180 }}
            />
          ) : (
            <motion.div 
              key="cracked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <img src="/cookie-cracked.png" alt="Cracked" className="w-56 h-56 object-contain" />
              
              {/* Облачко с предсказанием */}
              <motion.div 
                animate={{ y: [0, -10, 0], rotate: [-1, 1, -1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="mt-4 bg-white text-black p-4 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[250px] relative"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white"></div>
                <p className="font-black text-center text-sm uppercase leading-tight">{fortune}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Кнопка транзакции */}
      {isCracked && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-12 w-full max-w-[280px]"
        >
          {address ? (
            <Transaction
              chainId={84532}
              calls={[{ to: contractAddress, abi: contractAbi, functionName: 'claim' }]}
              isSponsored // Спонсирование газа включено
            >
              <TransactionButton className="w-full bg-black text-white border-4 border-white h-16 rounded-none font-black text-xl hover:bg-yellow-400 hover:text-black hover:border-black transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                CLAIM YOUR $ NOW
              </TransactionButton>
              <TransactionStatus>
                <TransactionStatusLabel className="text-center mt-2 text-xs" />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
          ) : (
            <Wallet>
              <ConnectWallet
                disconnectedLabel="CONNECT WALLET AND CLAIM YOUR PRIZE"
                className="!bg-[#7c89ff] !text-white !font-bold !border-none !shadow-none !outline-none !ring-0 rounded-xl hover:opacity-90 transition-all"
              />
            </Wallet>
          )}
        </motion.div>
      )}

      {!isCracked && (
        <p className="mt-12 text-blue-200 animate-pulse text-xs uppercase tracking-widest">
          {"\u{1F36A} CLICK TO REVEAL DESTINY \u{1F36A}"}
        </p>
      )}
    </div>
  );
}



```

## 
2026-02-09 20:35
 - Wrap ConnectWallet in motion.div with jelly hover/tap

Description: Add motion wrapper and update ConnectWallet styling per request.

Restore Point: `app/page.tsx`
```tsx
'use client';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion'; // Для крутых анимаций
import { 
  Transaction, 
  TransactionButton, 
  TransactionStatus, 
  TransactionStatusLabel, 
  TransactionStatusAction 
} from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';

const contractAbi = [{ type: 'function', name: 'claim', inputs: [], outputs: [], stateMutability: 'nonpayable' }] as const;

const FORTUNES = [
  "EVERYTHING IS BASED ON @BASE PUMP \u{1F680}",
  "ONCHAIN SUMMER NEVER ENDS \u{2600}\u{FE0F}",
  "MINT THE COOKIE, HODL THE CRUMB \u{1F36A}",
  "BASED AND BLUE-PILLED \u{1F535}",
  "YOUR GAS IS LOW, BUT YOUR VIBE IS HIGH \u{2728}",
  "EXIT LIQUIDITY? NO, JUST COOKIE LIQUIDITY \u{1F36C}",
  "BORN ONCHAIN, RAISED BY DEGENS \u{1F476}",
  "WAGMI: WE ARE ALL GONNA MINT COOKIES \u{1F95B}",
  "JESSE POLLAK APPROVES THIS MESSAGE \u{1F535}",
  "0.000001 ETH FOR A CRUMB? BULLISH \u{1F4C8}",
  "STAY BASED, STAY CRUNCHY \u{1F6E1}\u{FE0F}",
  "DEGEN LEVEL: MAXIMUM CRUNCH \u{1F479}",
  "PAPER HANDS CRUMBLE, DIAMOND HANDS CLINK \u{1F48E}",
  "ONCHAIN IS THE NEW ONLINE \u{1F310}",
  "GO TO BASE, DON'T LOOK BACK \u{1F535}"
];

export default function Home() {
  const { address } = useAccount();
  const [isCracked, setIsCracked] = useState(false);
  const [fortune, setFortune] = useState("");

  const contractAddress = process.env.NEXT_PUBLIC_COOKIEJAR_ADDRESS as `0x${string}`;

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-t from-[#ff71ce] via-[#b967ff] to-[#05ffa1] text-white p-6 font-mono">
      {/* Заголовок в стиле ретро-комикса */}
      <motion.h1 
        initial={{ y: -20 }} animate={{ y: 0 }}
        className="text-4xl font-black mb-12 tracking-tighter border-4 border-black bg-yellow-400 text-black px-4 py-2 rotate-[-2deg] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        style={{ textShadow: '0 2px 2px rgba(0, 0, 0, 0.85)' }}
      >
        BASED COOKIE
      </motion.h1>

      {/* Зона Печенья */}
      <div className="relative flex items-center justify-center h-64">
        <AnimatePresence mode="wait">
          {!isCracked ? (
            <motion.img
              key="whole"
              src="/cookie-whole.png"
              alt="Cookie"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCrack}
              className="w-48 h-48 cursor-pointer object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
              exit={{ scale: 0, opacity: 0, rotate: 180 }}
            />
          ) : (
            <motion.div 
              key="cracked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <img src="/cookie-cracked.png" alt="Cracked" className="w-56 h-56 object-contain" />
              
              {/* Облачко с предсказанием */}
              <motion.div 
                animate={{ y: [0, -10, 0], rotate: [-1, 1, -1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="mt-4 bg-white text-black p-4 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[250px] relative"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white"></div>
                <p className="font-black text-center text-sm uppercase leading-tight">{fortune}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Кнопка транзакции */}
      {isCracked && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-12 w-full max-w-[280px]"
        >
          {address ? (
            <Transaction
              chainId={84532}
              calls={[{ to: contractAddress, abi: contractAbi, functionName: 'claim' }]}
              isSponsored // Спонсирование газа включено
            >
              <TransactionButton className="w-full bg-black text-white border-4 border-white h-16 rounded-none font-black text-xl hover:bg-yellow-400 hover:text-black hover:border-black transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                CLAIM YOUR $ NOW
              </TransactionButton>
              <TransactionStatus>
                <TransactionStatusLabel className="text-center mt-2 text-xs" />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
          ) : (
            <Wallet>
              <ConnectWallet
                disconnectedLabel="CONNECT WALLET AND CLAIM YOUR PRIZE"
                className="!bg-[#7c89ff] !text-white !font-bold !border-none !shadow-none !outline-none !ring-0 rounded-xl hover:opacity-90 transition-all !border-b-4 !border-[#5a65c0] active:!border-b-0 active:!translate-y-[4px]"
              />
            </Wallet>
          )}
        </motion.div>
      )}

      {!isCracked && (
        <p className="mt-12 text-blue-200 animate-pulse text-xs uppercase tracking-widest">
          {"\u{1F36A} CLICK TO REVEAL DESTINY \u{1F36A}"}
        </p>
      )}
    </div>
  );
}



```

## 
2026-02-09 20:41
 - Update ConnectWallet label text

Description: Update ConnectWallet disconnected label to requested text.

Restore Point: `app/page.tsx`
```tsx
'use client';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion'; // Для крутых анимаций
import { 
  Transaction, 
  TransactionButton, 
  TransactionStatus, 
  TransactionStatusLabel, 
  TransactionStatusAction 
} from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';

const contractAbi = [{ type: 'function', name: 'claim', inputs: [], outputs: [], stateMutability: 'nonpayable' }] as const;

const FORTUNES = [
  "EVERYTHING IS BASED ON @BASE PUMP \u{1F680}",
  "ONCHAIN SUMMER NEVER ENDS \u{2600}\u{FE0F}",
  "MINT THE COOKIE, HODL THE CRUMB \u{1F36A}",
  "BASED AND BLUE-PILLED \u{1F535}",
  "YOUR GAS IS LOW, BUT YOUR VIBE IS HIGH \u{2728}",
  "EXIT LIQUIDITY? NO, JUST COOKIE LIQUIDITY \u{1F36C}",
  "BORN ONCHAIN, RAISED BY DEGENS \u{1F476}",
  "WAGMI: WE ARE ALL GONNA MINT COOKIES \u{1F95B}",
  "JESSE POLLAK APPROVES THIS MESSAGE \u{1F535}",
  "0.000001 ETH FOR A CRUMB? BULLISH \u{1F4C8}",
  "STAY BASED, STAY CRUNCHY \u{1F6E1}\u{FE0F}",
  "DEGEN LEVEL: MAXIMUM CRUNCH \u{1F479}",
  "PAPER HANDS CRUMBLE, DIAMOND HANDS CLINK \u{1F48E}",
  "ONCHAIN IS THE NEW ONLINE \u{1F310}",
  "GO TO BASE, DON'T LOOK BACK \u{1F535}"
];

export default function Home() {
  const { address } = useAccount();
  const [isCracked, setIsCracked] = useState(false);
  const [fortune, setFortune] = useState("");

  const contractAddress = process.env.NEXT_PUBLIC_COOKIEJAR_ADDRESS as `0x${string}`;

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-t from-[#ff71ce] via-[#b967ff] to-[#05ffa1] text-white p-6 font-mono">
      {/* Заголовок в стиле ретро-комикса */}
      <motion.h1 
        initial={{ y: -20 }} animate={{ y: 0 }}
        className="text-4xl font-black mb-12 tracking-tighter border-4 border-black bg-yellow-400 text-black px-4 py-2 rotate-[-2deg] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        style={{ textShadow: '0 2px 2px rgba(0, 0, 0, 0.85)' }}
      >
        BASED COOKIE
      </motion.h1>

      {/* Зона Печенья */}
      <div className="relative flex items-center justify-center h-64">
        <AnimatePresence mode="wait">
          {!isCracked ? (
            <motion.img
              key="whole"
              src="/cookie-whole.png"
              alt="Cookie"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCrack}
              className="w-48 h-48 cursor-pointer object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
              exit={{ scale: 0, opacity: 0, rotate: 180 }}
            />
          ) : (
            <motion.div 
              key="cracked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <img src="/cookie-cracked.png" alt="Cracked" className="w-56 h-56 object-contain" />
              
              {/* Облачко с предсказанием */}
              <motion.div 
                animate={{ y: [0, -10, 0], rotate: [-1, 1, -1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="mt-4 bg-white text-black p-4 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[250px] relative"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white"></div>
                <p className="font-black text-center text-sm uppercase leading-tight">{fortune}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Кнопка транзакции */}
      {isCracked && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-12 w-full max-w-[280px]"
        >
          {address ? (
            <Transaction
              chainId={84532}
              calls={[{ to: contractAddress, abi: contractAbi, functionName: 'claim' }]}
              isSponsored // Спонсирование газа включено
            >
              <TransactionButton className="w-full bg-black text-white border-4 border-white h-16 rounded-none font-black text-xl hover:bg-yellow-400 hover:text-black hover:border-black transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                CLAIM YOUR $ NOW
              </TransactionButton>
              <TransactionStatus>
                <TransactionStatusLabel className="text-center mt-2 text-xs" />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
          ) : (
            <Wallet>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95, y: 2 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <ConnectWallet
                  disconnectedLabel="Connect"
                  className="!bg-[#7c89ff] !text-white !font-bold !border-none !shadow-[0_6px_0_0_#5a65c0] rounded-xl"
                />
              </motion.div>
            </Wallet>
          )}
        </motion.div>
      )}

      {!isCracked && (
        <p className="mt-12 text-blue-200 animate-pulse text-xs uppercase tracking-widest">
          {"\u{1F36A} CLICK TO REVEAL DESTINY \u{1F36A}"}
        </p>
      )}
    </div>
  );
}



```

## 
2026-02-09 20:45
 - Update ConnectWallet label to CONNECT AND CLAIM

Description: Change ConnectWallet disconnected label to CONNECT AND CLAIM with gift emoji.

Restore Point: `app/page.tsx`
```tsx
'use client';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion'; // Для крутых анимаций
import { 
  Transaction, 
  TransactionButton, 
  TransactionStatus, 
  TransactionStatusLabel, 
  TransactionStatusAction 
} from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';

const contractAbi = [{ type: 'function', name: 'claim', inputs: [], outputs: [], stateMutability: 'nonpayable' }] as const;

const FORTUNES = [
  "EVERYTHING IS BASED ON @BASE PUMP \u{1F680}",
  "ONCHAIN SUMMER NEVER ENDS \u{2600}\u{FE0F}",
  "MINT THE COOKIE, HODL THE CRUMB \u{1F36A}",
  "BASED AND BLUE-PILLED \u{1F535}",
  "YOUR GAS IS LOW, BUT YOUR VIBE IS HIGH \u{2728}",
  "EXIT LIQUIDITY? NO, JUST COOKIE LIQUIDITY \u{1F36C}",
  "BORN ONCHAIN, RAISED BY DEGENS \u{1F476}",
  "WAGMI: WE ARE ALL GONNA MINT COOKIES \u{1F95B}",
  "JESSE POLLAK APPROVES THIS MESSAGE \u{1F535}",
  "0.000001 ETH FOR A CRUMB? BULLISH \u{1F4C8}",
  "STAY BASED, STAY CRUNCHY \u{1F6E1}\u{FE0F}",
  "DEGEN LEVEL: MAXIMUM CRUNCH \u{1F479}",
  "PAPER HANDS CRUMBLE, DIAMOND HANDS CLINK \u{1F48E}",
  "ONCHAIN IS THE NEW ONLINE \u{1F310}",
  "GO TO BASE, DON'T LOOK BACK \u{1F535}"
];

export default function Home() {
  const { address } = useAccount();
  const [isCracked, setIsCracked] = useState(false);
  const [fortune, setFortune] = useState("");

  const contractAddress = process.env.NEXT_PUBLIC_COOKIEJAR_ADDRESS as `0x${string}`;

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-t from-[#ff71ce] via-[#b967ff] to-[#05ffa1] text-white p-6 font-mono">
      {/* Заголовок в стиле ретро-комикса */}
      <motion.h1 
        initial={{ y: -20 }} animate={{ y: 0 }}
        className="text-4xl font-black mb-12 tracking-tighter border-4 border-black bg-yellow-400 text-black px-4 py-2 rotate-[-2deg] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        style={{ textShadow: '0 2px 2px rgba(0, 0, 0, 0.85)' }}
      >
        BASED COOKIE
      </motion.h1>

      {/* Зона Печенья */}
      <div className="relative flex items-center justify-center h-64">
        <AnimatePresence mode="wait">
          {!isCracked ? (
            <motion.img
              key="whole"
              src="/cookie-whole.png"
              alt="Cookie"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCrack}
              className="w-48 h-48 cursor-pointer object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
              exit={{ scale: 0, opacity: 0, rotate: 180 }}
            />
          ) : (
            <motion.div 
              key="cracked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <img src="/cookie-cracked.png" alt="Cracked" className="w-56 h-56 object-contain" />
              
              {/* Облачко с предсказанием */}
              <motion.div 
                animate={{ y: [0, -10, 0], rotate: [-1, 1, -1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="mt-4 bg-white text-black p-4 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[250px] relative"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white"></div>
                <p className="font-black text-center text-sm uppercase leading-tight">{fortune}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Кнопка транзакции */}
      {isCracked && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-12 w-full max-w-[280px]"
        >
          {address ? (
            <Transaction
              chainId={84532}
              calls={[{ to: contractAddress, abi: contractAbi, functionName: 'claim' }]}
              isSponsored // Спонсирование газа включено
            >
              <TransactionButton className="w-full bg-black text-white border-4 border-white h-16 rounded-none font-black text-xl hover:bg-yellow-400 hover:text-black hover:border-black transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                CLAIM YOUR $ NOW
              </TransactionButton>
              <TransactionStatus>
                <TransactionStatusLabel className="text-center mt-2 text-xs" />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
          ) : (
            <Wallet>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95, y: 2 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <ConnectWallet
                  disconnectedLabel="connect wallet and claim $"
                  className="!bg-[#7c89ff] !text-white !font-bold !border-none !shadow-[0_6px_0_0_#5a65c0] rounded-xl"
                />
              </motion.div>
            </Wallet>
          )}
        </motion.div>
      )}

      {!isCracked && (
        <p className="mt-12 text-blue-200 animate-pulse text-xs uppercase tracking-widest">
          {"\u{1F36A} CLICK TO REVEAL DESTINY \u{1F36A}"}
        </p>
      )}
    </div>
  );
}



```

## 

## 
2026-02-09 21:13
 - Add frame SDK ready effect

Description: Add frame SDK ready() call on mount to hide splash screen.

Restore Point: `app/page.tsx`
```tsx
'use client';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion'; // Для крутых анимаций
import { 
  Transaction, 
  TransactionButton, 
  TransactionStatus, 
  TransactionStatusLabel, 
  TransactionStatusAction 
} from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';

const contractAbi = [{ type: 'function', name: 'claim', inputs: [], outputs: [], stateMutability: 'nonpayable' }] as const;

const FORTUNES = [
  "EVERYTHING IS BASED ON @BASE PUMP \u{1F680}",
  "ONCHAIN SUMMER NEVER ENDS \u{2600}\u{FE0F}",
  "MINT THE COOKIE, HODL THE CRUMB \u{1F36A}",
  "BASED AND BLUE-PILLED \u{1F535}",
  "YOUR GAS IS LOW, BUT YOUR VIBE IS HIGH \u{2728}",
  "EXIT LIQUIDITY? NO, JUST COOKIE LIQUIDITY \u{1F36C}",
  "BORN ONCHAIN, RAISED BY DEGENS \u{1F476}",
  "WAGMI: WE ARE ALL GONNA MINT COOKIES \u{1F95B}",
  "JESSE POLLAK APPROVES THIS MESSAGE \u{1F535}",
  "0.000001 ETH FOR A CRUMB? BULLISH \u{1F4C8}",
  "STAY BASED, STAY CRUNCHY \u{1F6E1}\u{FE0F}",
  "DEGEN LEVEL: MAXIMUM CRUNCH \u{1F479}",
  "PAPER HANDS CRUMBLE, DIAMOND HANDS CLINK \u{1F48E}",
  "ONCHAIN IS THE NEW ONLINE \u{1F310}",
  "GO TO BASE, DON'T LOOK BACK \u{1F535}"
];

export default function Home() {
  const { address } = useAccount();
  const [isCracked, setIsCracked] = useState(false);
  const [fortune, setFortune] = useState("");

  const contractAddress = process.env.NEXT_PUBLIC_COOKIEJAR_ADDRESS as `0x${string}`;

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-t from-[#ff71ce] via-[#b967ff] to-[#05ffa1] text-white p-6 font-mono">
      {/* Заголовок в стиле ретро-комикса */}
      <motion.h1 
        initial={{ y: -20 }} animate={{ y: 0 }}
        className="text-4xl font-black mb-12 tracking-tighter border-4 border-black bg-yellow-400 text-black px-4 py-2 rotate-[-2deg] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        style={{ textShadow: '0 2px 2px rgba(0, 0, 0, 0.85)' }}
      >
        BASED COOKIE
      </motion.h1>

      {/* Зона Печенья */}
      <div className="relative flex items-center justify-center h-64">
        <AnimatePresence mode="wait">
          {!isCracked ? (
            <motion.img
              key="whole"
              src="/cookie-whole.png"
              alt="Cookie"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCrack}
              className="w-48 h-48 cursor-pointer object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
              exit={{ scale: 0, opacity: 0, rotate: 180 }}
            />
          ) : (
            <motion.div 
              key="cracked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <img src="/cookie-cracked.png" alt="Cracked" className="w-56 h-56 object-contain" />
              
              {/* Облачко с предсказанием */}
              <motion.div 
                animate={{ y: [0, -10, 0], rotate: [-1, 1, -1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="mt-4 bg-white text-black p-4 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[250px] relative"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white"></div>
                <p className="font-black text-center text-sm uppercase leading-tight">{fortune}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Кнопка транзакции */}
      {isCracked && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-12 w-full max-w-[280px]"
        >
          {address ? (
            <Transaction
              chainId={84532}
              calls={[{ to: contractAddress, abi: contractAbi, functionName: 'claim' }]}
              isSponsored // Спонсирование газа включено
            >
              <TransactionButton className="w-full bg-black text-white border-4 border-white h-16 rounded-none font-black text-xl hover:bg-yellow-400 hover:text-black hover:border-black transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                CLAIM YOUR $ NOW
              </TransactionButton>
              <TransactionStatus>
                <TransactionStatusLabel className="text-center mt-2 text-xs" />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
          ) : (
            <Wallet>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95, y: 2 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <ConnectWallet
                  disconnectedLabel={"CONNECT AND CLAIM \u{1F381}"}
                  className="!bg-[#7c89ff] !text-white !font-bold !border-none !shadow-[0_6px_0_0_#5a65c0] rounded-xl"
                />
              </motion.div>
            </Wallet>
          )}
        </motion.div>
      )}

      {!isCracked && (
        <p className="mt-12 text-blue-200 animate-pulse text-xs uppercase tracking-widest">
          {"\u{1F36A} CLICK TO REVEAL DESTINY \u{1F36A}"}
        </p>
      )}
    </div>
  );
}



```

## 
2026-02-09 21:20
 - Add fc:frame metadata in layout

Description: Update generateMetadata to include fc:frame JSON metadata for frames.

Restore Point: `app/layout.tsx`
```tsx
import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import { SafeArea } from "@coinbase/onchainkit/minikit";
import { minikitConfig } from "@/minikit.config";
import { RootProvider } from "./rootProvider";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: minikitConfig.miniapp.name,
    description: minikitConfig.miniapp.description,
    other: {
      "fc:miniapp": JSON.stringify({
        version: minikitConfig.miniapp.version,
        imageUrl: minikitConfig.miniapp.heroImageUrl,
        button: {
          title: `Launch ${minikitConfig.miniapp.name}`,
          action: {
            name: `Launch ${minikitConfig.miniapp.name}`,
            type: "launch_miniapp",
          },
        },
      }),
    },
  };
}

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RootProvider>
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
        </head>
        <body className={`${inter.variable} ${sourceCodePro.variable}`}>
          <SafeArea>{children}</SafeArea>
        </body>
      </html>
    </RootProvider>
  );
}
```
