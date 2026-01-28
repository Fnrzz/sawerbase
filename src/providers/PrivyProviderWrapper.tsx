'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets';
import { baseSepolia } from 'viem/chains';

export default function PrivyProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    console.error('Missing NEXT_PUBLIC_PRIVY_APP_ID'); 
  }

  return (
    <PrivyProvider
      appId={appId || ''}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#7c3aed', 
        },
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],
        loginMethods: ['email', 'wallet'],
        embeddedWallets: {
          ethereum: {
             createOnLogin: 'users-without-wallets',
          },
          // noPromptOnSignature: true, // Fix: Property does not exist in sensitive types. 
        },
      }}
    >
      <SmartWalletsProvider
        config={{
            paymasterContext: {
                paymasterUrl: '/api/paymaster'
            }
        }}
      >
        {children}
      </SmartWalletsProvider>
    </PrivyProvider>
  );
}
