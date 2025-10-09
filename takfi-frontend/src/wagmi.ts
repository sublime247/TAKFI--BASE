import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
    baseSepolia,
    arbitrum,
    base,
    mainnet,
    optimism,
    polygon,
    sepolia,
} from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'Takfi',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'c4f79cc821944d9680842e34466bfb', // Temporary working project ID
    chains: [
        base,
        baseSepolia,
        mainnet,
        polygon,
        optimism,
        arbitrum,
        ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
    ],
    ssr: true,
});