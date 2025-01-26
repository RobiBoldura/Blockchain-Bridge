import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { toB64 } from '@mysten/sui.js/utils';

function generateAndShowKeys() {
    // Generate a new keypair
    const keypair = Ed25519Keypair.generate();
    
    // Get the private key bytes (first 32 bytes)
    const privateKeyBytes = keypair.export().privateKey.slice(0, 32);
    
    // Convert to base64
    const privateKeyB64 = Buffer.from(privateKeyBytes).toString('base64');
    
    // Get the address
    const address = keypair.getPublicKey().toSuiAddress();
    
    console.log('Generated Sui Keys:');
    console.log('------------------');
    console.log('Private Key (base64):', privateKeyB64);
    console.log('Address:', address);
    console.log('\nAdd these to your .env files:');
    console.log('NEXT_PUBLIC_SUI_PRIVATE_KEY=' + privateKeyB64);
    console.log('NEXT_PUBLIC_ADMIN_ADDRESS=' + address);
}

generateAndShowKeys(); 