import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { type SuiTransactionBlockResponse, type OwnedObjectRef } from '@mysten/sui.js/client';
import { fromB64 } from '@mysten/sui.js/utils';
import * as dotenv from 'dotenv';

dotenv.config();

async function requestLocalSui(suiClient: SuiClient, address: string) {
    console.log('Checking SUI balance...');
    try {
        const balance = await suiClient.getBalance({
            owner: address,
            coinType: '0x2::sui::SUI'
        });

        console.log('Current SUI balance:', balance);
        
        // If balance is too low, throw error
        if (BigInt(balance.totalBalance) < BigInt(10000000000)) {
            throw new Error('Insufficient SUI balance. Please run "sui client gas" first.');
        }
        
        return true;
    } catch (error) {
        console.error('Failed to check SUI balance:', error);
        console.log('\nPlease run these commands first:');
        console.log('1. sui client gas');
        console.log('2. Wait a few seconds for the transaction to complete');
        console.log('Then try running this script again.\n');
        return false;
    }
}

async function initBridge() {
    try {
        // Create keypair from the private key
        const privateKeyB64 = process.env.NEXT_PUBLIC_SUI_PRIVATE_KEY;
        if (!privateKeyB64) {
            throw new Error('Missing NEXT_PUBLIC_SUI_PRIVATE_KEY in .env');
        }

        // Decode base64 and slice to get 32 bytes
        const privateKeyBytes = fromB64(privateKeyB64);
        const keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes.slice(0, 32));
        const address = keypair.getPublicKey().toSuiAddress();
        
        console.log('Using address:', address);

        // Connect to local network
        const suiClient = new SuiClient({ 
            url: 'http://127.0.0.1:9000'
        });

        // Check SUI balance first
        const hasBalance = await requestLocalSui(suiClient, address);
        if (!hasBalance) {
            return;
        }
        
        const tx = new TransactionBlock();
        
        // Call initialize_bridge
        tx.moveCall({
            target: `${process.env.NEXT_PUBLIC_SUI_PACKAGE_ID}::bridge::initialize_bridge`,
            arguments: [],
        });

        console.log('Sending transaction...');
        
        const result = await suiClient.signAndExecuteTransactionBlock({
            transactionBlock: tx,
            signer: keypair,
            options: { 
                showEffects: true,
                showEvents: true
            }
        });
        
        console.log('Transaction result:', result);
        
        // Get the created BridgeAdmin object
        if (result.effects?.created) {
            const bridgeAdmin = result.effects.created.find(
                (obj: OwnedObjectRef) => {
                    if (typeof obj.owner === 'object' && 'AddressOwner' in obj.owner) {
                        return obj.owner.AddressOwner === address;
                    }
                    return false;
                }
            );
            
            if (bridgeAdmin) {
                console.log('BridgeAdmin object created:', bridgeAdmin);
                console.log('BridgeAdmin object ID:', bridgeAdmin.reference.objectId);
            }
        }

    } catch (error) {
        console.error('Failed to initialize bridge:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
        }
    }
}

initBridge().catch(console.error); 