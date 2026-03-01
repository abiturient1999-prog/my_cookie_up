'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { sdk } from '@farcaster/miniapp-sdk';
import { encodeFunctionData } from 'viem';
import {
  Transaction,
  TransactionButton
} from '@coinbase/onchainkit/transaction';
import type { LifecycleStatus } from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contract';
import { getClientPaymasterUrl } from './paymaster';
import { getChainId } from '@/lib/network';
import { getExplorerTxUrl } from '@/lib/network';
import { getTodayUtc, getTodayFortuneIndexInArray } from '@/lib/fortune';
import { FORTUNE_DEFINITIONS } from '@/lib/fortune-definitions';

const CTA_BASE_CLASS =
  "w-full min-h-14 sm:min-h-16 px-4 sm:px-6 py-3 rounded-xl border-4 font-black uppercase leading-tight whitespace-nowrap text-[clamp(0.75rem,3.9vw,1.5rem)] transition-all active:shadow-none active:translate-x-1 active:translate-y-1";
const CLAIM_BUTTON_CLASS = `${CTA_BASE_CLASS} bg-black text-white border-white hover:bg-yellow-400 hover:text-black hover:border-black shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]`;
const SHARE_BUTTON_CLASS = `${CTA_BASE_CLASS} bg-white text-black border-black hover:bg-cyan-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`;
const CONNECT_BUTTON_CLASS =
  "!w-full !min-h-14 sm:!min-h-16 !px-4 sm:!px-6 !py-3 !rounded-xl !border-4 !border-black !bg-[#7c89ff] !text-white !font-black !uppercase !leading-tight !whitespace-nowrap !text-[clamp(0.75rem,3.9vw,1.5rem)] !shadow-[0_6px_0_0_#5a65c0] transition-all hover:!bg-[#6f7cf5] active:!shadow-none active:translate-x-1 active:translate-y-1";

type TxNotice = {
  phase: 'pending' | 'success' | 'error';
  message: string;
  txHash?: string;
};

const TX_NOTICE_STYLE = {
  pending: 'bg-yellow-200 text-black border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
  success: 'bg-[#05ffa1] text-black border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
  error: 'bg-[#ff8fa3] text-black border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
} as const;

function getTxErrorMessage(status: LifecycleStatus): string {
  if (status.statusName !== 'error') return 'TRANSACTION FAILED';
  const data = status.statusData as { message?: string; code?: string; errorCode?: number } | undefined;
  const msg = data?.message ?? '';
  const code = data?.code ?? data?.errorCode;
  if (code === -32603 || msg.toLowerCase().includes('user rejected') || msg.toLowerCase().includes('rejected')) {
    return 'YOU REJECTED THE TRANSACTION';
  }
  if (code === -32002 || msg.toLowerCase().includes('paymaster') || msg.toLowerCase().includes('allowlist')) {
    return 'PAYMASTER LIMIT. TRY AGAIN LATER OR USE GAS';
  }
  if (msg) return `FAILED: ${msg.slice(0, 60).toUpperCase()}${msg.length > 60 ? '…' : ''}`;
  return 'TRANSACTION FAILED. TRY AGAIN';
}

export default function Home() {
  const { address } = useAccount();
  const [userFid, setUserFid] = useState<number | null>(null);
  const [isCracked, setIsCracked] = useState(false);
  const [fortune, setFortune] = useState('');
  const [fortuneId, setFortuneId] = useState<string>('');
  const [txNotice, setTxNotice] = useState<TxNotice | null>(null);
  const [dismissedNoticeKey, setDismissedNoticeKey] = useState<string | null>(null);
  const [cooldownEndsAt, setCooldownEndsAt] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await sdk.quickAuth.fetch(`${typeof window !== 'undefined' ? window.location.origin : ''}/api/auth`);
        if (cancelled) return;
        const data = await res.json();
        if (res.ok && typeof data.userFid === 'number') setUserFid(data.userFid);
      } catch {
        // not in miniapp or no JWT — leave userFid null, use random fortune
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await sdk.quickAuth.fetch(
          `${typeof window !== 'undefined' ? window.location.origin : ''}/api/fortune/status?address=${encodeURIComponent(address)}`
        );
        if (cancelled || !res.ok) return;
        const data = await res.json();
        const st = data?.status;
        if (st?.nextClaimAvailableAt && st.isCooldownActive) {
          const nextAt = new Date(st.nextClaimAvailableAt).getTime();
          setCooldownEndsAt(nextAt);
        }
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [address]);

  useEffect(() => {
    if (!cooldownEndsAt) return;
    const timerId = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timerId);
  }, [cooldownEndsAt]);

  useEffect(() => {
    if (cooldownEndsAt && cooldownEndsAt <= nowMs) setCooldownEndsAt(null);
  }, [cooldownEndsAt, nowMs]);

  const playCrunch = () => {
    const audio = new Audio('/crunch.mp3');
    audio.play();
  };

  const handleCrack = () => {
    if (isCracked) return;
    playCrunch();
    setIsCracked(true);
    const todayUtc = getTodayUtc();
    if (userFid !== null) {
      const idx = getTodayFortuneIndexInArray(userFid, todayUtc, FORTUNE_DEFINITIONS.length);
      const def = FORTUNE_DEFINITIONS[idx];
      setFortune(def.text);
      setFortuneId(def.id);
    } else {
      const idx = Math.floor(Math.random() * FORTUNE_DEFINITIONS.length);
      const def = FORTUNE_DEFINITIONS[idx];
      setFortune(def.text);
      setFortuneId(def.id);
    }
  };

  const handleShare = () => {
    const shareText = `I just cracked a Based Cookie and got this fortune: "${fortune}" 🍪✨`;
    const shareUrl = "https://basedcookie.vercel.app";
    const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(shareUrl)}`;
    sdk.actions.openUrl(warpcastUrl);
  };

  const buildNoticeKey = (notice: TxNotice) => `${notice.phase}:${notice.txHash ?? notice.message}`;

  const openNotice = (notice: TxNotice) => {
    const key = buildNoticeKey(notice);
    if (dismissedNoticeKey === key) {
      return;
    }

    setTxNotice(notice);
  };

  const showPendingNotice = () => {
    setDismissedNoticeKey(null);
    openNotice({
      phase: 'pending',
      message: 'TRANSACTION IN PROGRESS...',
    });
  };

  const handleTxStatus = useCallback((status: LifecycleStatus) => {
    if (
      status.statusName === 'buildingTransaction' ||
      status.statusName === 'transactionPending' ||
      status.statusName === 'transactionLegacyExecuted'
    ) {
      showPendingNotice();
      return;
    }

    if (status.statusName === 'success') {
      const txHash = (status.statusData?.transactionReceipts?.[0]?.transactionHash as string | undefined);
      (async () => {
        if (!address || !fortuneId) {
          setCooldownEndsAt(Date.now() + 24 * 60 * 60 * 1000);
          openNotice({ phase: 'success', message: 'TRANSACTION SUCCESSFUL', txHash });
          return;
        }
        try {
          const res = await sdk.quickAuth.fetch(
            `${typeof window !== 'undefined' ? window.location.origin : ''}/api/fortune/claim`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ address, fortuneId, txHash }),
            }
          );
          const data = await res.json();
          if (res.ok && data?.updatedStatus?.nextClaimAvailableAt) {
            const nextAt = new Date(data.updatedStatus.nextClaimAvailableAt).getTime();
            setCooldownEndsAt(nextAt);
          } else {
            setCooldownEndsAt(Date.now() + 24 * 60 * 60 * 1000);
          }
          openNotice({ phase: 'success', message: 'TRANSACTION SUCCESSFUL', txHash });
        } catch {
          setCooldownEndsAt(Date.now() + 24 * 60 * 60 * 1000);
          openNotice({
            phase: 'error',
            message: 'CLAIM REGISTER FAILED. TRY AGAIN LATER.',
          });
        }
      })();
      return;
    }

    if (status.statusName === 'error') {
      openNotice({
        phase: 'error',
        message: getTxErrorMessage(status),
      });
      return;
    }

    if (status.statusName === 'reset' || status.statusName === 'transactionIdle') {
      setTxNotice(null);
      setDismissedNoticeKey(null);
      return;
    }
  }, [address, fortuneId, openNotice, showPendingNotice]);


  const closeTxNotice = () => {
    if (!txNotice) {
      return;
    }

    setDismissedNoticeKey(buildNoticeKey(txNotice));
    setTxNotice(null);
  };

  const txExplorerUrl = txNotice?.txHash ? getExplorerTxUrl(txNotice.txHash) : null;
  const remainingCooldownMs = cooldownEndsAt ? Math.max(cooldownEndsAt - nowMs, 0) : 0;
  const isCooldownActive = remainingCooldownMs > 0;

  const formatCooldown = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map((value) => value.toString().padStart(2, '0'))
      .join(':');
  };

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
            isCooldownActive ? (
              <div className="w-full rounded-xl border-4 border-black bg-yellow-200 p-4 text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-center text-[clamp(0.85rem,4vw,1.1rem)] font-black uppercase leading-tight">
                  NEXT CLAIM IN
                </p>
                <p className="mt-2 text-center text-[clamp(1.1rem,5vw,1.6rem)] font-black tracking-wide">
                  {formatCooldown(remainingCooldownMs)}
                </p>
              </div>
            ) : (
              <Transaction
                chainId={getChainId()}
                calls={calls}
                isSponsored={hasPaymaster}
                capabilities={capabilities}
                onStatus={handleTxStatus}
              >
                <TransactionButton
                  render={({ onSubmit, isDisabled }) => (
                    <button
                      type="button"
                      onClick={onSubmit}
                      disabled={isDisabled}
                      className={`${CLAIM_BUTTON_CLASS} disabled:cursor-not-allowed disabled:opacity-85`}
                    >
                      CLAIM YOUR 🍪 NOW
                    </button>
                  )}
                />
              </Transaction>
            )
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
        </motion.div>
      )}

      <AnimatePresence>
        {txNotice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              className={`relative w-full max-w-sm rounded-xl border-4 p-4 sm:p-5 ${TX_NOTICE_STYLE[txNotice.phase]}`}
            >
              {(txNotice.phase === 'success' || txNotice.phase === 'error') && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    closeTxNotice();
                  }}
                  className="absolute right-2 top-2 z-20 h-9 w-9 rounded-full border-2 border-black bg-white text-black text-xl font-black leading-none touch-manipulation"
                  aria-label="Close transaction status"
                >
                  ×
                </button>
              )}

              <p className="pr-10 text-[clamp(0.95rem,4.4vw,1.2rem)] font-black uppercase leading-tight">
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
          </motion.div>
        )}
      </AnimatePresence>

      {!isCracked && (
        <p className="mt-12 text-blue-200 animate-pulse text-xs uppercase tracking-widest">
          {"\u{1F36A} CLICK TO REVEAL DESTINY \u{1F36A}"}
        </p>
      )}
    </div>
  );
}
