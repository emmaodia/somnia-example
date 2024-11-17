import { useEffect, useState } from "react";

import { createWalletClient, custom, defineChain } from "viem";

const SOMNIA = defineChain({
  id: 50311,
  name: "Somnia",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "STT",
  },
  rpcUrls: {
    default: {
      http: ["https://dream-rpc.somnia.network"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://somnia-devnet.socialscan.io" },
  },
});

export default function Home() {
  const [client, setClient] = useState(null);
  const [address, setAddress] = useState(null);
  const [connected, setConnected] = useState(false);

  const connectToMetaMask = async () => {
    if (typeof window !== "undefined" && window.ethereum !== undefined) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const walletClient = createWalletClient({
          chain: SOMNIA,
          transport: custom(window.ethereum),
        });
        const [userAddress] = await walletClient.getAddresses();
        setClient(walletClient);
        setAddress(userAddress);
        setConnected(true);
        console.log("Connected account:", userAddress);
      } catch (error) {
        console.error("User denied account access:", error);
      }
    } else {
      console.log(
        "MetaMask is not installed or not running in a browser environment!"
      );
    }
  };

  return (
    <div className="flex flex-col p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {!connected ? (
        <button
          onClick={connectToMetaMask}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Connect Wallet
        </button>
      ) : (
        <div>Hello, {address}</div>
      )}
    </div>
  );
}
