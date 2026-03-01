import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { getFidFromRequest } from "@/lib/auth";
import {
  getLastClaim,
  isCooldownActive,
  getNextClaimAvailableAt,
  getRemainingCooldownMs,
} from "@/lib/fortune-store";
import { getTodayUtc, getTodayFortuneIndexInArray } from "@/lib/fortune";
import { FORTUNE_DEFINITIONS } from "@/lib/fortune-definitions";

export async function GET(request: NextRequest) {
  const fid = await getFidFromRequest(request);
  if (fid === null) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const addressParam = request.nextUrl.searchParams.get("address");
  if (!addressParam || !isAddress(addressParam)) {
    return NextResponse.json(
      { message: "Invalid or missing address" },
      { status: 400 }
    );
  }

  const address = addressParam as `0x${string}`;
  const user = { fid, address };

  const todayUtc = getTodayUtc();
  const idx = getTodayFortuneIndexInArray(fid, todayUtc, FORTUNE_DEFINITIONS.length);
  const todaysFortune = FORTUNE_DEFINITIONS[idx];
  const todaysFortuneAssignedAt = new Date(`${todayUtc}T00:00:00.000Z`).toISOString();

  const last = getLastClaim(fid, address);
  let lastClaimAt: string | undefined;
  let nextClaimAvailableAt: string | undefined;
  let isCooldown = false;
  let remainingCooldownMs = 0;

  if (last) {
    lastClaimAt = last.lastClaimAt;
    nextClaimAvailableAt = getNextClaimAvailableAt(last.lastClaimAt);
    isCooldown = isCooldownActive(last.lastClaimAt);
    remainingCooldownMs = getRemainingCooldownMs(last.lastClaimAt);
  }

  return NextResponse.json({
    status: {
      user,
      todaysFortune,
      todaysFortuneAssignedAt,
      lastClaimAt,
      nextClaimAvailableAt,
      isCooldownActive: isCooldown,
      remainingCooldownMs,
    },
  });
}
