# memory.md

## Meta
- Language: `ru`
- Reply prefix rule: first line must be `🐼`
- Project root: `c:\Users\bulat\Desktop\CURSOR\New folder\my_cookie_up`
- Stack: `Next.js 15`, `React 19`, `TypeScript`, `wagmi`, `viem`, `OnchainKit`, `Farcaster MiniApp SDK`
- Operating rule (user-defined): before each response, consult this file; update it after significant changes.

## Environment
- `.env` and `.env.local` (см. также `docs/env-and-schema.md`):
  - `NEXT_PUBLIC_BASE_NETWORK=sepolia|mainnet` — сеть приложения (по умолчанию sepolia).
  - `NEXT_PUBLIC_COOKIEJAR_ADDRESS` — адрес контракта (legacy); опционально `_SEPOLIA` / `_MAINNET` по сети.
  - `CDP_PAYMASTER_URL` — upstream Paymaster для proxy (Sepolia или mainnet по окружению).
  - `NEXT_PUBLIC_PAYMASTER_PROXY_SERVER_URL=/api/paymaster`; опционально `NEXT_PUBLIC_PAYMASTER_SEPOLIA_URL`, `NEXT_PUBLIC_PAYMASTER_MAINNET_URL`.
  - `.env.local` additionally: `PAYMASTER_PROXY_DEBUG=1`
  - Для этапа 2: `DATABASE_URL` (Neon pooler connection string).
- Security note: public client key exposure acknowledged; key rotation remains recommended.

## MCP/Docs Context
- MCP config path: `c:\Users\bulat\.cursor\mcp.json`
- MCP server listed: `Coinbase Developer` (`https://docs.cdp.coinbase.com/mcp`)
- User requirement: use Coinbase docs + public GitHub examples for architecture/UI decisions.

## Accepted Architecture Decisions
- `paymaster_proxy_server_side`:
  - Proxy endpoint: `app/api/paymaster/route.ts`
  - Only `pm_*` JSON-RPC methods allowed
  - Upstream source: server env `CDP_PAYMASTER_URL`
- `transaction_call_shape_explicit`:
  - Calls are explicit `{ to, data, value }`
  - `data` from `encodeFunctionData(CONTRACT_ABI, claimReward, [])`
  - `value = BigInt(0)`
- `contract_address_resolution`:
  - Priority: `NEXT_PUBLIC_COOKIEJAR_ADDRESS -> NEXT_PUBLIC_COOKIEFAUCET_ADDRESS -> default`
  - Validated by `isAddress`; fallback to default on invalid value
- `metadata_url_resolution`:
  - URL source in layout metadata: `NEXT_PUBLIC_URL` fallback `https://basedcookie.vercel.app`
  - Trailing slash trimmed
- `paymaster_url_absolute_normalization`:
  - Relative `/api/paymaster` normalized to absolute URL
  - Client uses `window.location.origin`
  - SSR fallback uses `NEXT_PUBLIC_URL`

## Current Code State

### `app/contract.ts`
- `DEFAULT_CONTRACT_ADDRESS = 0xEdE3...`
- `CONTRACT_ADDRESS`: по сети (`getBaseNetwork`) выбирается `_SEPOLIA` / `_MAINNET` или legacy env; validated `0x${string}`
- ABI includes `claimReward()`

### `lib/network.ts`
- `getBaseNetwork(): 'sepolia' | 'mainnet'` из `NEXT_PUBLIC_BASE_NETWORK`
- `getChainId()` — 84532 (Sepolia) или 8453 (mainnet)
- `getExplorerTxUrl(txHash)` — sepolia.basescan.org или basescan.org

### `lib/fortune.ts`
- `getTodayUtc()`, `getTodayFortuneIndex(fid, dateUtc)`, `getTodayFortuneIndexInArray(fid, dateUtc, length)` — детерминированная фортуна по (fid, date).

### `lib/fortune-definitions.ts`
- `FORTUNE_DEFINITIONS`, `FORTUNES_TEXTS` — общий справочник для клиента и API.

### `lib/fortune-store.ts`
- In-memory store клеймов (этап 1); ключ `fid:address`; на этапе 2 — Neon.

### `lib/auth.ts`
- `getUrlHost(request)`, `getFidFromRequest(request)` — верификация Farcaster JWT для API.

### `app/api/fortune/status/route.ts`
- `GET /api/fortune/status?address=0x...` — возвращает `{ status: FortuneStatus }` (JWT обязателен).

### `app/api/fortune/claim/route.ts`
- `POST /api/fortune/claim` — body `{ address, fortuneId, txHash?, claimedAt? }`; возвращает `claim`, `updatedStatus`, `updatedStats`; коды ошибок `COOLDOWN_ACTIVE`, `INVALID_FORTUNE_ID`.

### `app/paymaster.ts`
- Constants:
  - `ABSOLUTE_HTTP_URL_REGEX = ^https?://`
  - `RELATIVE_PATH_REGEX = ^/(?!/)`
- Functions:
  - `isValidPaymasterUrl(url): boolean`
  - `trimTrailingSlash(url): string`
  - `resolveAbsolutePaymasterUrl(configuredUrl): string | null`
  - `getClientPaymasterUrl(): string | null`

### `app/api/paymaster/route.ts`
- Constants:
  - `PAYMASTER_METHOD_PREFIX = pm_`
  - `JSON_CONTENT_TYPE = application/json`
  - `EXECUTE_SELECTOR = 0xb61d27f6`
  - `EXECUTE_BATCH_SELECTOR = 0x47e1da2a`
- Functions:
  - `isJsonRpcRequest(value)`
  - `isAllowedRequest(payload)`
  - `getPaymasterEndpoint()`
  - `parseExecuteTarget(callData)`
  - `getUserOperationCallData(payload)`
  - `POST(request)`
- Behavior:
  - `400` invalid JSON
  - `403` non-`pm_*`
  - `500` missing `CDP_PAYMASTER_URL`
  - `502` upstream fetch failure
  - Debug headers when `PAYMASTER_PROXY_DEBUG=1`:
    - `x-paymaster-debug-selector`
    - `x-paymaster-debug-target`
    - `x-paymaster-debug-value`

### `app/rootProvider.tsx`
- OnchainKit provider:
  - chain: `base` или `baseSepolia` по `getChainId()` (`NEXT_PUBLIC_BASE_NETWORK`)
  - paymaster: `getClientPaymasterUrl()`
  - wallet display: `modal`
  - wallet preference: `all`
  - miniKit: `enabled`, `autoConnect: true`

### `app/layout.tsx`
- Functions:
  - `getAppUrl()`
  - `generateMetadata()`
- Metadata:
  - `base:app_id = 697a5a842dbd4b464042ae9a`
  - `fc:miniapp` object built dynamically from app URL

### `app/page.tsx` (latest)
- Imports: OnchainKit, MiniApp SDK, `getChainId`/`getExplorerTxUrl` (lib/network), `getTodayUtc`/`getTodayFortuneIndexInArray` (lib/fortune), `FORTUNE_DEFINITIONS` (lib/fortune-definitions).
- Constants: `CTA_BASE_CLASS`, `CLAIM_BUTTON_CLASS`, `SHARE_BUTTON_CLASS`, `CONNECT_BUTTON_CLASS`, `TX_NOTICE_STYLE`.
- Types: `TxNotice = { phase, message, txHash? }`
- State: `userFid`, `isCracked`, `fortune`, `fortuneId`, `txNotice`, `dismissedNoticeKey`, `cooldownEndsAt`, `nowMs`
- Derived values:
  - `paymasterUrl`, `hasPaymaster`, `capabilities`, `claimRewardData`, `calls`
  - `txExplorerUrl` через `getExplorerTxUrl(txHash)` (сеть из env)
  - `remainingCooldownMs`, `isCooldownActive`
- Effects:
  - `sdk.actions.ready()`
  - fetch `/api/auth` → `userFid`
  - при наличии `address` fetch `GET /api/fortune/status?address=...` → синхронизация `cooldownEndsAt`
  - cooldown ticker и auto-clear
- Functions:
  - `playCrunch()`
  - `handleCrack()`
  - `handleShare()` -> opens Warpcast compose URL
  - `buildNoticeKey(notice)`
  - `openNotice(notice)` (respects dismissed key)
  - `showPendingNotice()`
  - `handleTxStatus(status)`:
    - pending lifecycle → pending notice
    - success → `POST /api/fortune/claim` с `address`, `fortuneId`, `txHash`; обновление кулдауна из `updatedStatus`; success/error notice
    - error → разбор по коду/сообщению (user rejected, paymaster -32002, и т.д.) через `getTxErrorMessage(status)`
    - reset/idle → clear notice
  - `closeTxNotice()`
  - `formatCooldown(ms) -> HH:MM:SS`
- UI behavior:
  - Mobile-first container with safe-area bottom padding
  - Unified button style, rounded corners, responsive text via `clamp()`
  - If wallet connected:
    - During cooldown: show `NEXT CLAIM IN` timer card, hide claim button
    - Otherwise: show claim button via `TransactionButton render`
  - Share button always shown in cracked state
  - Single custom transaction status overlay (`fixed`, bottom sheet style)
  - Close button `×` shown for `success/error`; success includes explorer link

## Icons / Branding State
- Browser/Next app icons now aligned to cookie asset:
  - `app/favicon.ico` regenerated from cookie image
  - `app/icon.png` created
  - `app/apple-icon.png` created
- MiniApp manifest icon cache-bust:
  - `public/icon-v2.png` created
  - `public/.well-known/farcaster.json` -> `miniapp.iconUrl = https://basedcookie.vercel.app/icon-v2.png`

## Verification History
- Repeatedly passed: `npx tsc --noEmit`
- Prior note: lint previously passed with `next/no-img-element` warning

## Known Issues / Open Tasks
- `paymaster_allowlist_denied` was observed earlier (`-32002`); runtime verification still needed on latest deploy.
- Need runtime confirmation that:
  - paymaster debug headers match intended contract target
  - tests are against latest deployed URL
  - Base Sepolia paymaster allowlist includes `0xEdE3...` and `claimReward()`
- Cooldown currently temporary in-memory for testing; planned future migration to onchain-based cooldown source.

## Working Preferences Captured
- Always provide a plan before execution.
- Focus ongoing work on frontend adaptation for mobile, button/text consistency, and transaction UX.

## Based Cookie — Stage Docs
- Stage 1 implementation guide: `docs/based-cookie-stage-1-minimal.md`
- Stage 2 implementation guide: `docs/based-cookie-stage-2-medium.md`
- Stage 3 implementation guide: `docs/based-cookie-stage-3-advanced.md`
- Env и схема БД (Vercel + Neon): `docs/env-and-schema.md`
