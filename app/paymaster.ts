const ABSOLUTE_HTTP_URL_REGEX = /^https?:\/\//i;
const RELATIVE_PATH_REGEX = /^\/(?!\/)/;

export function isValidPaymasterUrl(url: string): boolean {
  return ABSOLUTE_HTTP_URL_REGEX.test(url) || RELATIVE_PATH_REGEX.test(url);
}

function trimTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function resolveAbsolutePaymasterUrl(configuredUrl: string): string | null {
  if (ABSOLUTE_HTTP_URL_REGEX.test(configuredUrl)) {
    return configuredUrl;
  }

  if (!RELATIVE_PATH_REGEX.test(configuredUrl)) {
    return null;
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return new URL(configuredUrl, window.location.origin).toString();
  }

  const appUrl = process.env.NEXT_PUBLIC_URL?.trim();
  if (appUrl && ABSOLUTE_HTTP_URL_REGEX.test(appUrl)) {
    return new URL(configuredUrl, trimTrailingSlash(appUrl)).toString();
  }

  return null;
}

import { getBaseNetwork } from "@/lib/network";

/** URL Paymaster proxy для текущей сети. Fallback: NEXT_PUBLIC_PAYMASTER_PROXY_SERVER_URL или /api/paymaster */
export function getClientPaymasterUrl(): string | null {
  const network = getBaseNetwork();
  const configuredUrl =
    (network === "mainnet"
      ? process.env.NEXT_PUBLIC_PAYMASTER_MAINNET_URL?.trim()
      : process.env.NEXT_PUBLIC_PAYMASTER_SEPOLIA_URL?.trim()) ||
    process.env.NEXT_PUBLIC_PAYMASTER_PROXY_SERVER_URL?.trim() ||
    "/api/paymaster";

  if (!configuredUrl) {
    return null;
  }

  if (!isValidPaymasterUrl(configuredUrl)) {
    return null;
  }

  return resolveAbsolutePaymasterUrl(configuredUrl);
}
