'use client';

import { WagmiConfig, createConfig, http } from 'wagmi';
import { mainnet, localhost } from 'wagmi/chains';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create wagmi config
const config = createConfig({
  chains: [localhost],
  transports: {
    [localhost.id]: http(),
  },
});

// Create query client
const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider defaultNetwork="localnet" networks={{
          localnet: { url: 'http://127.0.0.1:9000' }
        }}>
          <WalletProvider autoConnect>{children}</WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
} 