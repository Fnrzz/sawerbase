'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { baseSepolia } from 'viem/chains';

export default function PrivyProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    console.error('Missing NEXT_PUBLIC_PRIVY_APP_ID');
    // We render children anyway to avoid complete white screen, but auth won't work
    // In dev, you might want to throw or show an alert.
  }

  return (
    <PrivyProvider
      appId={appId || ''}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#7c3aed', // Violet-600
        },
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],
        loginMethods: ['email', 'wallet'],
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
