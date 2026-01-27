import { createConfig, http } from 'wagmi';
import { baseSepolia } from 'viem/chains';

export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
  ssr: true, 
});
