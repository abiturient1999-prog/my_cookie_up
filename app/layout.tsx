import type { Metadata } from "next";
import { SafeArea } from "@coinbase/onchainkit/minikit";
import { RootProvider } from "./rootProvider";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    other: {
      "base:app_id": "697a5a842dbd4b464042ae9a",
      "fc:miniapp": JSON.stringify({
        version: "1",
        imageUrl: "https://basedcookie.vercel.app/embed.png",
        button: {
          title: "Crack the Cookie",
          action: {
            type: "launch_frame",
            name: "Based Cookie",
            url: "https://basedcookie.vercel.app",
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RootProvider>
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
        </head>
        <body className="antialiased">
          <SafeArea>{children}</SafeArea>
        </body>
      </html>
    </RootProvider>
  );
}
