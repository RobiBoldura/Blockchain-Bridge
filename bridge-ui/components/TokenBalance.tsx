'use client';

import { useAccount, useContractRead } from 'wagmi';
import { useWallets, useSuiClient } from '@mysten/dapp-kit';
import { formatEther, formatUnits } from 'viem';
import { useEffect, useState } from 'react';

// We'll add the ABI later
const tokenABI = [
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export default function TokenBalance() {
  const [suiBalance, setSuiBalance] = useState<string>('0');
  const { address: ethAddress } = useAccount();
  const wallets = useWallets();
  const suiWallet = wallets[0];
  const suiAddress = suiWallet?.accounts[0]?.address;
  const suiClient = useSuiClient();

  // Ensure useContractRead is always called
  const { data: ethBalance } = useContractRead({
    address: process.env.NEXT_PUBLIC_ETH_TOKEN_ADDRESS as `0x${string}`,
    abi: tokenABI,
    functionName: 'balanceOf',
    args: ethAddress ? [ethAddress] : undefined,
  });

  // Log Ethereum balance
  useEffect(() => {
    if (ethBalance) {
      console.log('Ethereum IBT Balance:', formatEther(ethBalance));
    } else {
      console.log('No Ethereum IBT balance found or wallet not connected.');
    }
  }, [ethBalance]);

  console.log('Connected Ethereum Address:', ethAddress);
  console.log('Ethereum Token Address:', process.env.NEXT_PUBLIC_ETH_TOKEN_ADDRESS);

  const fetchSuiBalance = async () => {
    if (!suiAddress) return;
    
    const packageId = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID;
    if (!packageId) {
      console.error('Missing NEXT_PUBLIC_SUI_PACKAGE_ID environment variable');
      return;
    }

    try {
      const coinMetadata = await suiClient.getCoinMetadata({
        coinType: `${packageId}::ibt::IBT`
      });

      if (!coinMetadata) {
        console.error('IBT coin type not found');
        return;
      }

      console.log('Coin Metadata:', coinMetadata); // Log coin metadata

      const coins = await suiClient.getCoins({
        owner: suiAddress,
        coinType: `${packageId}::ibt::IBT`,
      });
      
      console.log('Found coins:', coins); // Log found coins
      
      const totalBalance = coins.data.reduce((acc, coin) => {
        return acc + BigInt(coin.balance);
      }, BigInt(0));
      
      setSuiBalance(formatUnits(totalBalance, 9));
    } catch (error) {
      console.error('Error fetching Sui balance:', error);
    }
  };

  // Call fetchSuiBalance unconditionally
  useEffect(() => {
    fetchSuiBalance();
  }, [suiAddress, suiClient]);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-center">Token Balances</h2>
      <div className="flex flex-col items-center space-y-6">
        <div className="w-full max-w-md text-center">
          <h3 className="font-medium">Ethereum IBT Balance</h3>
          <p className="text-lg">
            {ethBalance 
              ? `${formatEther(ethBalance)} IBT`
              : 'Connect wallet to view balance'
            }
          </p>
        </div>
        <div className="w-full max-w-md text-center">
          <h3 className="font-medium">Sui IBT Balance</h3>
          <p className="text-lg">
            {suiAddress
              ? `${suiBalance} IBT`
              : 'Connect wallet to view balance'
            }
          </p>
          {suiAddress && (
            <p className="text-sm text-gray-500">
              Connected Address: {suiAddress}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
