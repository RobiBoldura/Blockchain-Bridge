import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { fromB64 } from '@mysten/sui.js/utils';

function generateKey() {
    try {
        // Generate a random 32-byte array for the private key
        const privateKey = new Uint8Array(32);
        crypto.getRandomValues(privateKey);
        
        // Create keypair from the 32-byte private key
        const keypair = Ed25519Keypair.fromSecretKey(privateKey);
        
        // Convert to base64
        const privateKeyB64 = Buffer.from(privateKey).toString('base64');
        
        console.log('Generated Sui Keys:');
        console.log('------------------');
        console.log('Private Key (base64):', privateKeyB64);
        console.log('Address:', keypair.getPublicKey().toSuiAddress());
        console.log('Private Key length:', privateKey.length, 'bytes');
        
        // Verify the length is correct
        const decoded = fromB64(privateKeyB64);
        console.log('Decoded length:', decoded.length, 'bytes');
        
    } catch (error) {
        console.error('Error generating key:', error);
    }
}

generateKey(); 