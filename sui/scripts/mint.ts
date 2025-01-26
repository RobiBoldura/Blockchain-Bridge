import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { fromB64 } from '@mysten/sui.js/utils';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function main() {
    // Initialize client for local network
    const client = new SuiClient({ url: 'http://127.0.0.1:9000' });

    // Load and validate private key
    const privateKeyHex = process.env.SUI_PRIVATE_KEY?.trim();
    if (!privateKeyHex) {
        throw new Error('Missing SUI_PRIVATE_KEY environment variable');
    }

    try {
        // Convert hex to bytes
        const privateKeyBytes = Uint8Array.from(
            Buffer.from(privateKeyHex, 'hex')
        );
        
        if (privateKeyBytes.length !== 32) {
            throw new Error(`Invalid private key length: ${privateKeyBytes.length} bytes`);
        }

        const keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
        const address = keypair.toSuiAddress();
        console.log('Package ID:', process.env.SUI_PACKAGE_ID);
        console.log('Minting to address:', address);

        // Create mint transaction
        const tx = new TransactionBlock();
        
        // Get the coin metadata
        const [coin] = tx.moveCall({
            target: `${process.env.SUI_PACKAGE_ID}::ibt::mint`,
            arguments: [
                tx.object(address), // recipient address as a Sui object
                tx.pure(1000000000), // amount to mint (as a number, not string)
            ],
        });

        // Transfer the minted coin to the recipient
        tx.transferObjects([coin], tx.pure(address));

        console.log('Executing transaction...');
        
        // Sign and execute the transaction
        const result = await client.signAndExecuteTransactionBlock({
            signer: keypair,
            transactionBlock: tx,
            options: {
                showEffects: true,
                showEvents: true,
            },
        });

        console.log('Mint transaction successful!');
        console.log('Transaction digest:', result.digest);
        console.log('Transaction effects:', result.effects);
        
    } catch (error: any) {
        console.error('Failed to mint tokens:', error);
        if (typeof error === 'object' && error !== null && 'message' in error) {
            console.error('Error message:', error.message);
        }
        // Print the package ID and other relevant info for debugging
        console.log('Debug info:');
        console.log('Package ID:', process.env.SUI_PACKAGE_ID);
        console.log('Network URL:', 'http://127.0.0.1:9000');
    }
}

main().catch((error: unknown) => {
    console.error('Top-level error:', error);
    if (typeof error === 'object' && error !== null && 'message' in error) {
        console.error('Error message:', (error as { message: string }).message);
    }
    process.exit(1);
}); 