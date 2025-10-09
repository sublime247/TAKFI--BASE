import type { HardhatUserConfig } from "hardhat/config";

// import HardhatIgnitionEthersPlugin from '@nomicfoundation/hardhat-ignition-ethers';
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable } from "hardhat/config";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
    baseSepolia: {
      type: "http",
      // chainType: "l2",
      url: "https://sepolia.base.org",
      accounts: [configVariable("BASE_SEPOLIA_PRIVATE_KEY")],
      chainId: 84532,
    },
    base: {
      type: "http",
      // chainType: "l2",
      url: "https://mainnet.base.org",
      accounts: [configVariable("BASE_MAINNET_PRIVATE_KEY")],
      chainId: 8453,
    },
  },
};

export default config;
