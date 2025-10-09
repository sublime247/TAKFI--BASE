'use client';
import type React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider} from 'wagmi';
import { RainbowKitProvider, Theme, darkTheme } from '@rainbow-me/rainbowkit';
import merge from 'lodash.merge';
import { config } from '../wagmi';

const queryClient = new QueryClient();

const myTheme = merge(darkTheme(), {
  colors: {
      accentColor: '#12D96A',
      accentColorForeground: '#0B0F0E',
  },
} as Theme);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={myTheme}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}   