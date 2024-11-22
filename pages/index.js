import { useEffect, useState } from "react";

import {
  createPublicClient,
  http,
  parseEther,
  createWalletClient,
  custom,
  formatEther,
  parseAbiItem,
  defineChain,
} from "viem";
import { ABI } from "../abi";
const CONTRACT_ADDRESS = "0x2e7f682863a9dcb32dd298ccf8724603728d0edd";

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

const publicClient = createPublicClient({
  chain: SOMNIA,
  transport: http(),
});

export default function Home() {
  const [client, setClient] = useState(null);
  const [address, setAddress] = useState(null);
  const [connected, setConnected] = useState(false);
  const [houseBalance, setHouseBalance] = useState("");
  const [toValue, setToValue] = useState("");
  const [amountValue, setAmountValue] = useState("");
  const [loading, setLoading] = useState(false);

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

  const fetchSymbol = async () => {
    try {
      const balance = await publicClient.readContract({
        address: CONTRACT_ADDRESS, // New contract address
        abi: ABI,
        functionName: "symbol",
      });
      setHouseBalance(balance);
    } catch (error) {
      console.error("Failed to fetch house balance:", error);
    }
  };

  const handleTo = (e) => {
    setToValue(e.target.value);
  };

  const handleAmount = (e) => {
    setAmountValue(e.target.value);
  };

  const testSendTxn = async () => {
    try {
      const hash = await client.sendTransaction({
        account: address,
        to: "0xb6e4fa6ff2873480590c68D9Aa991e5BB14Dbf03",
        value: 1000000000000000000n,
      });

      console.log(hash);
    } catch (error) {
      console.error(error, "failed");
    }
  };

  const sendTxn = async () => {
    console.log(amountValue, toValue);
    try {
      const hash = await client.sendTransaction({
        account: address,
        to: toValue,
        value: amountValue,
        // 1000000000000000000n,
      });

      console.log(hash);
      setLoading(false);
    } catch (error) {
      console.error(error, "failed");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Input value:", toValue, amountValue);
    sendTxn();
  };

  const testERC = async () => {
    try {
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "transfer",
        // value: 1000000000000000000n,
        args: [
          "0xb6e4fa6ff2873480590c68d9aa991e5bb14dbf03",
          1000000000000000000n,
        ],
        // parseEther(betAmount),
        account: address,
      });

      console.log(request);
      const hash = await client.writeContract(request);
      console.log(hash);
    } catch (error) {
      console.error(error, "failed");
    }
  };

  const nativeERC = async () => {
    console.log(amountValue, toValue);
    try {
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "transfer",
        // value: 1000000000000000000n,
        args: [toValue, parseEther(amountValue)],
        // parseEther(betAmount),
        account: address,
      });

      console.log(request);
      const hash = await client.writeContract(request);
      console.log(hash);
      setLoading(false);
    } catch (error) {
      console.error(error, "failed");
    }
  };

  const handleSubmitERC = (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Input value:", toValue, amountValue);
    nativeERC();
  };

  useEffect(() => {
    if (client && address) {
      fetchSymbol();
    }
  }, [client, address]);

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
        <div>
          <p>Connected as: {address}</p>
          <p>House Balance: {houseBalance} Ether</p>
          <button className="mt-5 px-5 py-2.5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            Faucet
          </button>
          <button
            onClick={testSendTxn}
            className="px-5 py-2.5 mx-5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Test TXN
          </button>
          <button
            onClick={testERC}
            className="px-5 py-2.5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Test ERC20
          </button>
          <div class="mt-10">
            <form
              onSubmit={handleSubmit}
              className="flex max-w-md flex-col gap-4"
            >
              Native Token Txn
              <div className="mt-3">
                <label
                  htmlFor="amount-input"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Receiver
                </label>
                <input
                  type="text"
                  id="amount-input"
                  value={toValue}
                  onChange={handleTo}
                  placeholder="Enter Recipient Address"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="amount-input"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Amount
                </label>
                <input
                  type="text"
                  id="amount-input"
                  value={amountValue}
                  onChange={handleAmount}
                  placeholder="Enter amount in ETH"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5  dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                disabled={loading}
              >
                {loading ? "processing..." : "Transfer"}
              </button>
            </form>
          </div>

          <div class="mt-10">
            <form
              onSubmit={handleSubmitERC}
              className="flex max-w-md flex-col gap-4"
            >
              ERC20 Token Txn
              <div className="mt-3">
                <label
                  htmlFor="amount-input"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Receiver
                </label>
                <input
                  type="text"
                  id="amount-input"
                  value={toValue}
                  onChange={handleTo}
                  placeholder="Enter Recipient Address"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="amount-input"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Amount
                </label>
                <input
                  type="text"
                  id="amount-input"
                  value={amountValue}
                  onChange={handleAmount}
                  placeholder="Enter amount in ETH"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5  dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                disabled={loading}
              >
                {loading ? "Processing..." : "Transfer"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
