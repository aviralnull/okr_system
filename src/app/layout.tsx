// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

import { Providers } from "@/components/providers/provider";
export const metadata: Metadata = {
  title:       "OKR Desk",
  description: "Goal tracking for modern teams",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}