import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { SuiClient } from '@mysten/sui.js/client';
import * as dotenv from 'dotenv';

dotenv.config();

async function requestSui() {
    try {
        // Create keypair from the private key
        const privateKeyB64 = process.env.SUI_PRIVATE_KEY;
        if (!privateKeyB64) {
            throw new Error('Missing SUI_PRIVATE_KEY in .env');
        }

        const privateKeyBytes = Buffer.from(privateKeyB64, 'base64');
        const keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
        const address = keypair.getPublicKey().toSuiAddress();
        
        console.log('Requesting SUI for address:', address);

        // Connect to devnet
        const client = new SuiClient({ 
            url: 'https://fullnode.devnet.sui.io:443'
        });

        // Request from faucet
        const response = await fetch('https://faucet.devnet.sui.io/gas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                FixedAmountRequest: {
                    recipient: address
                }
            }),
        });

        const result = await response.json();
        console.log('Faucet response:', result);

        // Wait a few seconds and check balance
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const balance = await client.getBalance({
            owner: address,
            coinType: '0x2::sui::SUI'
        });

        console.log('Current balance:', balance);

    } catch (error) {
        console.error('Failed to request SUI:', error);
    }
}

requestSui().catch(console.error); 