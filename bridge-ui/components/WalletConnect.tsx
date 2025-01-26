'use client';

import { useEffect, useState } from 'react';
import { useConnect, useDisconnect, useAccount } from 'wagmi';
import { useWallets, useConnectWallet } from '@mysten/dapp-kit';

export default function WalletConnect() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address: ethAddress, isConnected } = useAccount();
  const wallets = useWallets();
  const { mutate: connectWallet } = useConnectWallet();
  const [suiAddress, setSuiAddress] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  // Get the current connected wallet
  const currentWallet = wallets.length > 0 ? wallets[0] : null;
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (currentWallet?.accounts?.[0]) {
      setSuiAddress(currentWallet.accounts[0].address);
      console.log('Connected to wallet:', currentWallet.accounts[0].address);
    } else {
      setSuiAddress('');
    }
  }, [currentWallet]);

  const handleSuiConnect = async () => {
    try {
      if (currentWallet) {
        await connectWallet({ wallet: currentWallet });
      }
    } catch (error) {
      console.error('Failed to connect to Sui wallet:', error);
    }
  };

  if (!mounted) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Connect Wallets</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">MetaMask Wallet</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Connect MetaMask
            </button>
          </div>
          <div>
            <h3 className="font-medium mb-2">Sui Wallet</h3>
            <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
              Connect Sui Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Connect Wallets</h2>
      
      <div className="space-y-4">
        {/* MetaMask Wallet Section */}
        <div>
          <h3 className="font-medium mb-2">MetaMask Wallet</h3>
          <button
            onClick={isConnected ? () => disconnect() : () => connect({ connector: connectors[0] })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {ethAddress 
              ? `Connected: ${ethAddress.slice(0, 6)}...${ethAddress.slice(-4)}` 
              : 'Connect MetaMask'
            }
          </button>
        </div>

        {/* Sui Wallet Section */}
        <div>
          <h3 className="font-medium mb-2">Sui Wallet</h3>
          {wallets.length === 0 ? (
            <div className="text-red-500 text-sm mb-2">
              No Sui wallet detected. Please install a wallet.
            </div>
          ) : (
            <button
              onClick={handleSuiConnect}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              {suiAddress 
                ? `Connected: ${suiAddress.slice(0, 6)}...${suiAddress.slice(-4)}`
                : 'Connect Sui Wallet'
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}