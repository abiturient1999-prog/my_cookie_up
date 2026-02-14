const ABSOLUTE_HTTP_URL_REGEX = /^https?:\/\//i;
const RELATIVE_PATH_REGEX = /^\/(?!\/)/;

export function isValidPaymasterUrl(url: string): boolean {
  return ABSOLUTE_HTTP_URL_REGEX.test(url) || RELATIVE_PATH_REGEX.test(url);
}

export function getClientPaymasterUrl(): string | null {
  const configuredUrl =
    process.env.NEXT_PUBLIC_PAYMASTER_PROXY_SERVER_URL?.trim() || "/api/paymaster";

  if (!configuredUrl) {
    return null;
  }

  return isValidPaymasterUrl(configuredUrl) ? configuredUrl : null;
}
