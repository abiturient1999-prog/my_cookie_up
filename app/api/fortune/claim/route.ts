import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { getFidFromRequest } from "@/lib/auth";
import {
  getLastClaim,
  setClaim,
  isCooldownActive,
  getNextClaimAvailableAt,
  getRemainingCooldownMs,
} from "@/lib/fortune-store";
import { getTodayUtc, getTodayFortuneIndexInArray } from "@/lib/fortune";
import { FORTUNE_DEFINITIONS } from "@/lib/fortune-definitions";

export async function POST(request: NextRequest) {
  const fid = await getFidFromRequest(request);
  if (fid === null) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: { address?: string; fortuneId?: string; txHash?: string; claimedAt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const addressParam = body.address;
  if (!addressParam || !isAddress(addressParam)) {
    return NextResponse.json(
      { message: "Invalid or missing address", code: "INVALID_ADDRESS" },
      { status: 400 }
    );
  }

  const address = addressParam as `0x${string}`;
  const user = { fid, address };

  const todayUtc = getTodayUtc();
  const idx = getTodayFortuneIndexInArray(fid, todayUtc, FORTUNE_DEFINITIONS.length);
  const expectedFortune = FORTUNE_DEFINITIONS[idx];

  const fortuneId = body.fortuneId ?? expectedFortune.id;
  if (fortuneId !== expectedFortune.id) {
    return NextResponse.json(
      { message: "Fortune does not match today's fortune", code: "INVALID_FORTUNE_ID" },
      { status: 400 }
    );
  }

  const last = getLastClaim(fid, address);
  if (last && isCooldownActive(last.lastClaimAt)) {
    return NextResponse.json(
      { message: "Cooldown active", code: "COOLDOWN_ACTIVE" },
      { status: 400 }
    );
  }

  const claimedAt = body.claimedAt ?? new Date().toISOString();
  const txHash = body.txHash as `0x${string}` | undefined;
  const stored = setClaim(fid, address, claimedAt, txHash);

  const nextClaimAvailableAt = getNextClaimAvailableAt(stored.lastClaimAt);
  const isCooldown = isCooldownActive(stored.lastClaimAt);
  const remainingCooldownMs = getRemainingCooldownMs(stored.lastClaimAt);

  const claim = {
    id: `claim_${Date.now()}_${fid}_${address.slice(0, 10)}`,
    user: { fid, address },
    fortuneId: expectedFortune.id,
    claimedAt: stored.lastClaimAt,
    txHash: stored.txHash,
  };

  const updatedStatus = {
    user,
    todaysFortune: expectedFortune,
    todaysFortuneAssignedAt: new Date(`${todayUtc}T00:00:00.000Z`).toISOString(),
    lastClaimAt: stored.lastClaimAt,
    nextClaimAvailableAt,
    isCooldownActive: isCooldown,
    remainingCooldownMs,
  };

  const updatedStats = {
    user,
    totalClaims: stored.totalClaims,
    rareClaims: 0,
    legendaryClaims: 0,
    lastClaimAt: stored.lastClaimAt,
    bestStreakDays: 0,
    currentStreakDays: 0,
  };

  return NextResponse.json({
    claim,
    updatedStatus,
    updatedStats,
  });
}
