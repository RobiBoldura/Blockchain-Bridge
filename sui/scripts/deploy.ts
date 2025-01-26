import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import path from 'path';

dotenv.config();

async function requestSuiFromFaucet(client: SuiClient, address: string) {
    console.log('Requesting SUI from faucet for address:', address);
    try {
        // Request coins from local faucet
        const tx = new TransactionBlock();
        const [coin] = tx.splitCoins(tx.gas, [tx.pure(10000000000)]); // Request 10 SUI
        tx.transferObjects([coin], tx.pure(address));

        // Execute faucet transaction
        const result = await client.devInspectTransactionBlock({
            transactionBlock: tx,
            sender: address,
        });

        console.log('Faucet request successful');
        return true;
    } catch (error) {
        console.error('Failed to request from faucet:', error);
        return false;
    }
}

async function main() {
    // Initialize client for local network
    const client = new SuiClient({ url: 'http://127.0.0.1:9000' });

    // Load private key from env
    const privateKeyHex = process.env.SUI_PRIVATE_KEY?.trim();
    if (!privateKeyHex) {
        throw new Error('Missing SUI_PRIVATE_KEY environment variable');
    }

    try {
        // Convert hex to bytes for the private key
        const privateKeyBytes = Uint8Array.from(
            Buffer.from(privateKeyHex, 'hex')
        );
        
        const keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
        const address = keypair.toSuiAddress();
        console.log('Deploying from address:', address);

        // Request SUI from faucet first
        await requestSuiFromFaucet(client, address);

        // Wait a bit for the faucet transaction to complete
        console.log('Waiting for faucet transaction to complete...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Build the package
        console.log('Building package...');
        execSync('sui move build', { stdio: 'inherit' });

        // Create deployment transaction
        const tx = new TransactionBlock();
        
        // Get the compiled package from the build output
        const { modules, dependencies } = JSON.parse(
            execSync('sui move build --dump-bytecode-as-base64', { encoding: 'utf-8' })
        );

        // Publish the package
        const [upgradeCap] = tx.publish({
            modules,
            dependencies,
        });

        // Transfer the upgrade cap to the deployer
        tx.transferObjects([upgradeCap], tx.pure(address));

        console.log('Publishing package...');
        
        // Sign and execute the transaction
        const result = await client.signAndExecuteTransactionBlock({
            signer: keypair,
            transactionBlock: tx,
            options: {
                showEffects: true,
                showEvents: true,
            },
        });

        console.log('Deployment successful!');
        console.log('Transaction digest:', result.digest);

        // Extract the package ID from the transaction effects
        const packageId = result.effects?.created?.find(
            (item) => item.owner === 'Immutable'
        )?.reference?.objectId;

        if (packageId) {
            console.log('Package ID:', packageId);
            
            // Update .env file with the package ID
            const envPath = path.join(__dirname, '..', '.env');
            const envContent = `
SUI_PRIVATE_KEY=${privateKeyHex}
SUI_ADDRESS=${address}
SUI_PACKAGE_ID=${packageId}
`.trim();

            writeFileSync(envPath, envContent);
            console.log('Updated .env file with package ID');
        } else {
            console.error('Failed to get package ID from transaction');
        }

    } catch (error: any) {
        console.error('Failed to deploy:', error);
        if (typeof error === 'object' && error !== null && 'message' in error) {
            console.error('Error message:', error.message);
        }
    }
}

main().catch((error: unknown) => {
    console.error('Top-level error:', error);
    if (typeof error === 'object' && error !== null && 'message' in error) {
        console.error('Error message:', (error as { message: string }).message);
    }
    process.exit(1);
});
