# memory.md

## Meta
- Language preference: Russian (`ru`)
- Project root: `c:\Users\bulat\Desktop\CURSOR\New folder\my_cookie_up`
- Stack: Next.js 15, React 19, TypeScript, Wagmi, Viem, OnchainKit, Farcaster MiniApp
- Working rule: before each further response, use this file as source of truth and update it after significant code/architecture/task changes.

## Environment snapshot
- `.env`:
  - `NEXT_PUBLIC_ONCHAINKIT_API_KEY=MWcCz1uvDUPKd7UkafDA2bsG6ny244kt`
  - `NEXT_PUBLIC_COOKIEJAR_ADDRESS=0xEdE3bd8e85557DA8184cfF520d617489CC7e4093`
  - `CDP_PAYMASTER_URL=https://api.developer.coinbase.com/rpc/v1/base-sepolia/MWcCz1uvDUPKd7UkafDA2bsG6ny244kt`
  - `NEXT_PUBLIC_PAYMASTER_PROXY_SERVER_URL=/api/paymaster`
- `.env.local`:
  - same as `.env`
  - `PAYMASTER_PROXY_DEBUG=1`
- Security note (from dialog): client key already exposed publicly; rotation recommended.

## Accepted architecture decisions

### 1) Paymaster proxy (server-side)
- Implemented `app/api/paymaster/route.ts`.
- Proxies only JSON-RPC methods with prefix `pm_`.
- Upstream endpoint comes only from server env `CDP_PAYMASTER_URL`.
- Client uses proxy URL (`/api/paymaster` or `NEXT_PUBLIC_PAYMASTER_PROXY_SERVER_URL`).

### 2) Transaction call format
- Contract call moved to explicit call object:
  - `to`
  - `data` (from `encodeFunctionData`)
  - `value: BigInt(0)`
- `isSponsored` enabled if valid paymaster URL exists on client.
- `capabilities.paymasterService.url` also passed to `Transaction`.

### 3) Contract address resolution
- Source order:
  1. `NEXT_PUBLIC_COOKIEJAR_ADDRESS`
  2. `NEXT_PUBLIC_COOKIEFAUCET_ADDRESS`
  3. default constant
- Address validation via `isAddress` with fallback to default.

### 4) MiniApp metadata URL
- `app/layout.tsx` uses `NEXT_PUBLIC_URL` with fallback `https://basedcookie.vercel.app`.
- Trailing slash removed.
- `fc:miniapp` metadata includes embed image and launch URL.

### 5) Paymaster URL normalization for wallet compatibility
- `app/paymaster.ts` resolves relative `/api/paymaster` to absolute URL.
- On client: uses `window.location.origin`.
- SSR fallback: uses `NEXT_PUBLIC_URL`.
- Motivation: wallet rejected relative capability URL (`invalid request: capabilities.paymasterService.url = /api/paymaster`).

## Current code state (key files)

### `app/contract.ts`
- `DEFAULT_CONTRACT_ADDRESS = 0xEdE3bd8e85557DA8184cfF520d617489CC7e4093`
- `CONTRACT_ADDRESS` is env-driven + validated.
- `CONTRACT_ABI` contains `claimReward()`.

### `app/paymaster.ts`
- `isValidPaymasterUrl(url)` accepts absolute `http(s)` and relative `/...`.
- `resolveAbsolutePaymasterUrl(configuredUrl)` converts relative path to absolute URL.
- `getClientPaymasterUrl()` returns normalized absolute URL or `null`.

### `app/api/paymaster/route.ts`
- Validates JSON-RPC shape.
- Allows only `pm_*` methods.
- Rejects invalid JSON (`400`), invalid method (`403`), missing config (`500`), upstream unreachable (`502`).
- Debug mode (`PAYMASTER_PROXY_DEBUG=1`):
  - logs parsed selector/target/value
  - adds response headers:
    - `x-paymaster-debug-selector`
    - `x-paymaster-debug-target`
    - `x-paymaster-debug-value`
- Parse helpers for `execute` / `executeBatch` selectors:
  - `0xb61d27f6`
  - `0x47e1da2a`

### `app/rootProvider.tsx`
- `OnchainKitProvider`:
  - `chain: baseSepolia`
  - `config.paymaster: getClientPaymasterUrl()`
  - wallet display modal, preference all
  - miniKit enabled + autoConnect

### `app/page.tsx` (current)
- Uses:
  - `useAccount`
  - `encodeFunctionData` for `claimReward`
  - `Transaction`, `TransactionButton`, `TransactionStatus`, `TransactionStatusLabel`, `TransactionStatusAction`
  - `Wallet`, `ConnectWallet`
- State:
  - `isCracked`, `fortune`
- Paymaster:
  - `paymasterUrl`, `hasPaymaster`, `capabilities.paymasterService.url`
- Calls:
  - `to: CONTRACT_ADDRESS`
  - `data: claimRewardData`
  - `value: BigInt(0)`
- Share:
  - `handleShare()` builds Warpcast compose URL and calls `sdk.actions.openUrl(warpcastUrl)`
- Layout/UI (latest accepted edits):
  - cookie container: `min-h-[420px]`
  - action container: `mt-6 w-full max-w-[90%] sm:max-w-md flex flex-col gap-4`
  - claim button text: `CLAIM YOUR 🍪 NOW`
  - claim button class uses responsive `text-lg sm:text-2xl` and `h-14 sm:h-20`
  - share button exists below transaction area with matching responsive retro style
- Note: despite earlier request to remove `View transaction`, current `page.tsx` still imports and renders `TransactionStatusAction` (state of latest file).

### `app/layout.tsx`
- `getAppUrl()` derives app URL from `NEXT_PUBLIC_URL` with fallback.
- `generateMetadata()` sets Farcaster/Base metadata payload.

## Verification history
- Multiple successful runs during dialog:
  - `npx tsc --noEmit` (pass after each valid patch)
  - `npm run lint` pass with warning about `<img>` usage
- Known environment limitations observed previously:
  - `npm run build` in sandbox failed fetching Google Fonts
  - `npm run dev` sandbox `spawn EPERM` (environment restriction)

## Error timeline and diagnostics (from dialog)
- Main production error:
  - `pm_getPaymasterStubData` code `-32002`
  - denied: called address not in allowlist (seen address `0xd8dA...`)
- Interpretation:
  - policy saw unexpected target address/call, not intended contract.
- Required diagnostics identified:
  - collect `x-paymaster-debug-*` headers from `/api/paymaster`
  - verify testing URL is latest deploy
  - verify Paymaster allowlist: Base Sepolia + contract `0xEdE3...` + `claimReward()`

## Task ledger (current)
- `diagnose_actual_target`: open, waiting for real runtime debug headers.
- `confirm_runtime_source`: open, ensure test runs on latest deployment URL.
- `paymaster_policy_sync`: open, verify/adjust CDP allowlist.
- `key_rotation`: recommended, rotate exposed client API key.

## Change log summary (dialog scope)
- Implemented/adjusted:
  - server paymaster proxy
  - contract/address/env validation path
  - capabilities + sponsorship in transaction flow
  - absolute paymaster URL resolver for wallet compatibility
  - multiple `app/page.tsx` redesign/rollback cycles
  - share button integration via MiniKit URL open
- Repeated rollbacks requested by user were applied as requested at each step.

## Current repository state
- At snapshot creation time: `git status --short` returned clean working tree.
