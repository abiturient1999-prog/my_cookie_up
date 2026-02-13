This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-onchain`](https://www.npmjs.com/package/create-onchain).


## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Next, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.


## Learn More

To learn more about OnchainKit, see our [documentation](https://docs.base.org/onchainkit).

To learn more about Next.js, see the [Next.js documentation](https://nextjs.org/docs).

## Environment Variables

Create a `.env.local` with the values below for transaction support:

```bash
NEXT_PUBLIC_ONCHAINKIT_API_KEY=
NEXT_PUBLIC_COOKIEJAR_ADDRESS=0x...
NEXT_PUBLIC_PAYMASTER_URL=https://...
```

`NEXT_PUBLIC_PAYMASTER_URL` is required for sponsored transactions (`isSponsored`) and must start with `http://` or `https://`.
