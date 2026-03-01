import { createClient } from "@farcaster/quick-auth";
import { NextRequest } from "next/server";

const client = createClient();

export function getUrlHost(request: NextRequest): string {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host;
    } catch {
      // ignore
    }
  }
  const host = request.headers.get("host");
  if (host) return host;
  let urlValue: string;
  if (process.env.VERCEL_ENV === "production") {
    urlValue = process.env.NEXT_PUBLIC_URL ?? "https://basedcookie.vercel.app";
  } else if (process.env.VERCEL_URL) {
    urlValue = `https://${process.env.VERCEL_URL}`;
  } else {
    urlValue = "http://localhost:3000";
  }
  return new URL(urlValue).host;
}

/**
 * Верифицирует Farcaster JWT из заголовка Authorization и возвращает FID.
 * Возвращает null при отсутствии/невалидном токене.
 */
export async function getFidFromRequest(request: NextRequest): Promise<number | null> {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  try {
    const payload = await client.verifyJwt({
      token: authorization.slice(7),
      domain: getUrlHost(request),
    });
    return payload.sub;
  } catch {
    return null;
  }
}
