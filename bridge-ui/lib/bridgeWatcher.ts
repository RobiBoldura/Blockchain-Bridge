import { createPublicClient, http, parseAbiItem } from 'viem';
import { localhost } from 'viem/chains';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiClient } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';

const bridgeEventAbi = parseAbiItem('event TokensLocked(address indexed from, uint256 amount, string suiAddress)');

export function setupBridgeWatcher(suiClient: SuiClient) {
  const publicClient = createPublicClient({
    chain: localhost,
    transport: http()
  });

  return publicClient.watchEvent({
    address: process.env.NEXT_PUBLIC_BRIDGE_ADDRESS as `0x${string}`,
    event: bridgeEventAbi,
    onLogs: async (logs) => {
      for (const log of logs) {
        if (!log.args || !log.args.from || !log.args.amount || !log.args.suiAddress) {
          console.error('Invalid log arguments:', log);
          continue;
        }

        const { from, amount, suiAddress } = log.args;
        console.log('Bridge event detected:', { 
          from, 
          amount: amount.toString(), 
          suiAddress 
        });

        try {
          // Validate environment variables
          if (!process.env.NEXT_PUBLIC_SUI_PACKAGE_ID) {
            throw new Error('Missing NEXT_PUBLIC_SUI_PACKAGE_ID');
          }
          if (!process.env.NEXT_PUBLIC_ADMIN_ADDRESS) {
            throw new Error('Missing NEXT_PUBLIC_ADMIN_ADDRESS');
          }
          if (!process.env.NEXT_PUBLIC_SUI_PRIVATE_KEY) {
            throw new Error('Missing NEXT_PUBLIC_SUI_PRIVATE_KEY');
          }

          const tx = new TransactionBlock();
          
          // Get the AdminCap object
          const adminCaps = await suiClient.getOwnedObjects({
            owner: process.env.NEXT_PUBLIC_ADMIN_ADDRESS,
            filter: {
              StructType: `${process.env.NEXT_PUBLIC_SUI_PACKAGE_ID}::bridge::BridgeAdmin`
            }
          });

          if (!adminCaps.data[0]?.data?.objectId) {
            throw new Error(`AdminCap not found for address: ${process.env.NEXT_PUBLIC_ADMIN_ADDRESS}`);
          }

          // Convert amount from ETH (18 decimals) to SUI (9 decimals)
          const ethDecimals = BigInt(1e18);
          const suiDecimals = BigInt(1e9);
          const suiAmount = (BigInt(amount) * suiDecimals) / ethDecimals;

          // Build the transaction
          tx.moveCall({
            target: `${process.env.NEXT_PUBLIC_SUI_PACKAGE_ID}::bridge::bridge_to_recipient`,
            arguments: [
              tx.object(adminCaps.data[0].data.objectId),
              tx.pure(suiAmount.toString()),
              tx.pure(suiAddress),
              tx.pure(Array.from(Buffer.from(from.slice(2), 'hex'))),
            ],
          });

          // Execute the transaction
          const result = await suiClient.signAndExecuteTransactionBlock({
            transactionBlock: tx,
            signer: Ed25519Keypair.fromSecretKey(
              Buffer.from(process.env.NEXT_PUBLIC_SUI_PRIVATE_KEY, 'base64')
            ),
            options: {
              showEffects: true,
              showEvents: true,
            },
          });

          console.log('Sui transaction completed:', result);

        } catch (error) {
          console.error('Bridge error:', error);
        }
      }
    }
  });
}
