'use client';

import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { config } from '@/config/wagmi';
import PrivyProviderWrapper from './PrivyProviderWrapper';
import { LanguageProvider } from '@/context/LanguageContext';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProviderWrapper>
      <LanguageProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryClientProvider client={queryClient}>
            <WagmiProvider config={config}>
              {children}
            </WagmiProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </LanguageProvider>
    </PrivyProviderWrapper>
  );
}
