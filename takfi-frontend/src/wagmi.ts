import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
    baseSepolia,
    base,
    mainnet,
    sepolia,
} from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'Takfi',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'c4f79cc821944d9680842e34466bfb',
    chains: [
        base,
        baseSepolia,
        mainnet,
        ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
    ],
    ssr: true,
});