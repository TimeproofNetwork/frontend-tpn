"use client";

import { configureChains, createClient, Chain } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { InjectedConnector } from "wagmi/connectors/injected";

// ✅ Manual Sepolia chain object for wagmi v0
const sepolia: Chain = {
  id: 11155111,
  name: "Sepolia",
  network: "sepolia",
  nativeCurrency: {
    name: "SepoliaETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia.infura.io/v3/2b420accc9603aba386fffc190e54c5f"], // ✅ Your Infura Project ID
    },
    public: {
      http: ["https://rpc.sepolia.org"],
    },
  },
  blockExplorers: {
    default: { name: "Etherscan", url: "https://sepolia.etherscan.io" },
  },
  testnet: true,
};

const { chains, provider } = configureChains(
  [sepolia],
  [publicProvider()]
);

export const wagmiClient = createClient({
  autoConnect: true,
  connectors: [new InjectedConnector({ chains })],
  provider,
});

export { chains };


