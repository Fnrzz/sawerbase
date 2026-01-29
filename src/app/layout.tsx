import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Link from "next/link";
import Image from "next/image";

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
  icons: {
    icon: "/logo.webp",
  },
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
            <div className="absolute top-4 left-4 z-50">
              <Link href="/" className="flex items-center gap-2">
                  <Image src="/logo.webp" alt="SawerBase" width={32} height={32} className="w-8 h-8 rounded-full" />
                  <span className="font-bold text-lg tracking-tight hidden sm:block">Sawer<span className="text-violet-500">Base</span></span>
              </Link>
            </div>
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
