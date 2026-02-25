'use client';
import { useState, useEffect, useMemo, type MouseEventHandler } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion'; // Р”Р»СЏ РєСЂСѓС‚С‹С… Р°РЅРёРјР°С†РёР№
import { sdk } from '@farcaster/miniapp-sdk';
import { encodeFunctionData } from 'viem';
import { 
  Transaction, 
  TransactionButton
} from '@coinbase/onchainkit/transaction';
import type { LifecycleStatus, TransactionError, TransactionResponseType } from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contract';
import { getClientPaymasterUrl } from './paymaster';

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

const CTA_BASE_CLASS =
  "w-full min-h-14 sm:min-h-16 px-4 sm:px-6 py-3 rounded-xl border-4 font-black uppercase leading-tight whitespace-nowrap text-[clamp(0.75rem,3.9vw,1.5rem)] transition-all active:shadow-none active:translate-x-1 active:translate-y-1";
const CLAIM_BUTTON_CLASS = `${CTA_BASE_CLASS} bg-black text-white border-white hover:bg-yellow-400 hover:text-black hover:border-black shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]`;
const SHARE_BUTTON_CLASS = `${CTA_BASE_CLASS} bg-white text-black border-black hover:bg-cyan-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`;
const CONNECT_BUTTON_CLASS =
  "!w-full !min-h-14 sm:!min-h-16 !px-4 sm:!px-6 !py-3 !rounded-xl !border-4 !border-black !bg-[#7c89ff] !text-white !font-black !uppercase !leading-tight !whitespace-nowrap !text-[clamp(0.75rem,3.9vw,1.5rem)] !shadow-[0_6px_0_0_#5a65c0] transition-all hover:!bg-[#6f7cf5] active:!shadow-none active:translate-x-1 active:translate-y-1";

type TxNotice = {
  phase: 'idle' | 'pending' | 'success' | 'error';
  message: string;
  txHash?: string;
};

const TX_NOTICE_STYLE = {
  pending: 'bg-yellow-200 text-black border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
  success: 'bg-[#05ffa1] text-black border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
  error: 'bg-[#ff8fa3] text-black border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
} as const;

export default function Home() {
  const { address } = useAccount();
  const [isCracked, setIsCracked] = useState(false);
  const [fortune, setFortune] = useState("");
  const [txNotice, setTxNotice] = useState<TxNotice>({ phase: 'idle', message: '' });
  const [isTxNoticeOpen, setIsTxNoticeOpen] = useState(false);
  const paymasterUrl = getClientPaymasterUrl();
  const hasPaymaster = Boolean(paymasterUrl);
  const capabilities = useMemo(() => {
    if (!paymasterUrl) {
      return undefined;
    }

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
    sdk.actions.ready();
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

  const handleShare = () => {
    const shareText = `I just cracked a Based Cookie and got this fortune: "${fortune}" 🍪✨`;
    const shareUrl = "https://basedcookie.vercel.app";
    const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(shareUrl)}`;
    sdk.actions.openUrl(warpcastUrl);
  };

  const showPendingNotice = () => {
    setTxNotice({
      phase: 'pending',
      message: 'TRANSACTION IN PROGRESS...',
    });
    setIsTxNoticeOpen(true);
  };

  const handleTxStatus = (status: LifecycleStatus) => {
    if (
      status.statusName === 'buildingTransaction' ||
      status.statusName === 'transactionPending' ||
      status.statusName === 'transactionLegacyExecuted'
    ) {
      showPendingNotice();
      return;
    }

    if (status.statusName === 'success') {
      const txHash = status.statusData.transactionReceipts[0]?.transactionHash;
      setTxNotice({
        phase: 'success',
        message: 'TRANSACTION SUCCESSFUL',
        txHash,
      });
      setIsTxNoticeOpen(true);
      return;
    }

    if (status.statusName === 'error') {
      setTxNotice({
        phase: 'error',
        message: status.statusData?.message
          ? `TRANSACTION FAILED: ${status.statusData.message.toUpperCase()}`
          : 'TRANSACTION FAILED',
      });
      setIsTxNoticeOpen(true);
    }
  };

  const handleTxSuccess = (response: TransactionResponseType) => {
    const txHash = response.transactionReceipts[0]?.transactionHash;
    setTxNotice({
      phase: 'success',
      message: 'TRANSACTION SUCCESSFUL',
      txHash,
    });
    setIsTxNoticeOpen(true);
  };

  const handleTxError = (error: TransactionError) => {
    setTxNotice({
      phase: 'error',
      message: error?.message ? `TRANSACTION FAILED: ${error.message.toUpperCase()}` : 'TRANSACTION FAILED',
    });
    setIsTxNoticeOpen(true);
  };

  const closeTxNotice = () => {
    setIsTxNoticeOpen(false);
    setTxNotice({ phase: 'idle', message: '' });
  };

  const handleCloseTxNotice: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeTxNotice();
  };

  const txExplorerUrl = txNotice.txHash ? `https://sepolia.basescan.org/tx/${txNotice.txHash}` : null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-t from-[#ff71ce] via-[#b967ff] to-[#05ffa1] text-white px-4 pt-6 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-6 font-mono">
      {/* Р—Р°РіРѕР»РѕРІРѕРє РІ СЃС‚РёР»Рµ СЂРµС‚СЂРѕ-РєРѕРјРёРєСЃР° */}
      <motion.h1 
        initial={{ y: -20 }} animate={{ y: 0 }}
        className="text-4xl font-black mb-12 tracking-tighter border-4 border-black bg-yellow-400 text-black px-4 py-2 rotate-[-2deg] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        style={{ textShadow: '0 2px 2px rgba(0, 0, 0, 0.85)' }}
      >
        BASED COOKIE
      </motion.h1>

      {/* Р—РѕРЅР° РџРµС‡РµРЅСЊСЏ */}
      <div className="relative flex items-center justify-center min-h-[420px]">
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
              
              {/* РћР±Р»Р°С‡РєРѕ СЃ РїСЂРµРґСЃРєР°Р·Р°РЅРёРµРј */}
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

      {/* РљРЅРѕРїРєР° С‚СЂР°РЅР·Р°РєС†РёРё */}
      {isCracked && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-6 w-full max-w-sm sm:max-w-md flex flex-col gap-4"
        >
          {address ? (
            <Transaction
              chainId={84532}
              calls={calls}
              isSponsored={hasPaymaster}
              capabilities={capabilities}
              onStatus={handleTxStatus}
              onSuccess={handleTxSuccess}
              onError={handleTxError}
            >
              <TransactionButton
                className={CLAIM_BUTTON_CLASS}
                text="CLAIM YOUR 🍪 NOW"
                pendingOverride={{ text: 'TRANSACTION IN PROGRESS...' }}
                successOverride={{ text: 'CLAIM COMPLETED ✅', onClick: () => undefined }}
                errorOverride={{ text: 'TRY CLAIM AGAIN', onClick: () => undefined }}
              />
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
                  className={CONNECT_BUTTON_CLASS}
                />
              </motion.div>
            </Wallet>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className={SHARE_BUTTON_CLASS}
          >
            Share Fortune ↗
          </motion.button>

          {isTxNoticeOpen && txNotice.phase !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative w-full rounded-xl border-4 p-4 sm:p-5 ${TX_NOTICE_STYLE[txNotice.phase]}`}
            >
              {(txNotice.phase === 'success' || txNotice.phase === 'error') && (
                <button
                  type="button"
                  onClick={handleCloseTxNotice}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  className="absolute right-2 top-2 z-20 h-8 w-8 rounded-full border-2 border-black bg-white text-black text-lg font-black leading-none touch-manipulation"
                  aria-label="Close transaction status"
                >
                  ×
                </button>
              )}

              <p className="pr-10 text-[clamp(0.85rem,4vw,1.1rem)] font-black uppercase leading-tight">
                {txNotice.message}
              </p>

              {txNotice.phase === 'success' && txExplorerUrl && (
                <a
                  href={txExplorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex rounded-lg border-2 border-black bg-white px-3 py-2 text-sm font-black uppercase text-black transition hover:bg-black hover:text-white"
                >
                  View Transaction ↗
                </a>
              )}
            </motion.div>
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
