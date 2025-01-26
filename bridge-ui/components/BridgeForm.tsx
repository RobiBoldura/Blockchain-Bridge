'use client';

import { useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { parseEther } from 'viem';
import { useWallets } from '@mysten/dapp-kit';
import { toast } from 'react-hot-toast';
import { tokenABI, bridgeABI } from '../lib/abis';
import { setupBridgeWatcher } from '../lib/bridgeWatcher';
import { checkBridgeRequirements } from '../lib/checkBalances';
import { SuiClient } from '@mysten/sui.js/client';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

interface BridgeState {
  status: 'idle' | 'approving' | 'bridging' | 'completed' | 'error';
  error: string | null;
}

export default function BridgeForm() {
  const { address: ethAddress } = useAccount();
  const [amount, setAmount] = useState('');
  const [bridgeState, setBridgeState] = useState<BridgeState>({
    status: 'idle',
    error: null
  });
  
  const wallets = useWallets();
  const suiAddress = wallets[0]?.accounts[0]?.address;
  const publicClient = usePublicClient();
  
  // Initialize Sui client
  const suiClient = new SuiClient({ 
    url: process.env.NEXT_PUBLIC_SUI_RPC_URL || 'https://fullnode.devnet.sui.io:443'
  });

  const { writeContract: approveTokens } = useWriteContract();
  const { writeContract: bridgeTokens } = useWriteContract();

  const resetBridgeState = () => {
    setBridgeState({ status: 'idle', error: null });
  };

  const handleEthToSuiBridge = async () => {
    if (!publicClient) {
      toast.error('Network client not initialized');
      return;
    }

    if (!ethAddress || !suiAddress) {
      toast.error('Please connect both wallets first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setBridgeState({ status: 'approving', error: null });
      
      await approveTokens({
        abi: tokenABI,
        address: process.env.NEXT_PUBLIC_ETH_TOKEN_ADDRESS as `0x${string}`,
        functionName: 'approve',
        args: [process.env.NEXT_PUBLIC_BRIDGE_ADDRESS as `0x${string}`, parseEther(amount)]
      });

      setBridgeState({ status: 'bridging', error: null });
      
      await bridgeTokens({
        abi: bridgeABI,
        address: process.env.NEXT_PUBLIC_BRIDGE_ADDRESS as `0x${string}`,
        functionName: 'bridgeToSui',
        args: [parseEther(amount), suiAddress]
      });

      setAmount('');
      setBridgeState({ status: 'completed', error: null });
      toast.success('Tokens bridged successfully! Please wait for confirmation on Sui network.');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setBridgeState({ status: 'error', error: errorMessage });
      toast.error(`Bridge failed: ${errorMessage}`);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-center">Bridge ETH to SUI</h2>
      <div className="border p-4 rounded-lg mb-4">
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount in ETH"
          className="border rounded p-2 w-full mb-4"
        />
        <button
          onClick={handleEthToSuiBridge}
          className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700"
        >
          Bridge Tokens
        </button>
        {bridgeState.error && <p className="text-red-500 text-center mt-2">{bridgeState.error}</p>}
      </div>
    </div>
  );
}
