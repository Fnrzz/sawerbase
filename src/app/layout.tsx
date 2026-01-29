import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Providers } from "@/providers/Providers";
import { Toaster } from "@/components/ui/sonner";
import { BottomNav } from "@/components/layout/BottomNav";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import AuthGuard from "@/components/auth/AuthGuard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SawerBase",
  description: "Decentralized Livestream Donations on Base Sepolia",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background flex justify-center text-foreground antialiased`}>
        <Providers>
          <AuthGuard>
          <div id="app-wrapper" className="w-full max-w-[480px] min-h-screen flex flex-col relative">
            <div className="absolute top-4 right-4 z-50 flex gap-2">
              <LanguageToggle />
              <ModeToggle />
            </div>
            {children}
            <Toaster />
            <BottomNav />
          </div>
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}
