import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { fromB64 } from '@mysten/sui.js/utils';

function generateAndShowKeys() {
    // Generate a new keypair
    const keypair = new Ed25519Keypair();
    
    // Get the private key in base64
    const privateKeyB64 = Buffer.from(keypair.export().privateKey).toString('base64');
    
    // Get the public address
    const address = keypair.getPublicKey().toSuiAddress();
    
    console.log('Generated Sui Keys:');
    console.log('------------------');
    console.log('Private Key (base64):', privateKeyB64);
    console.log('Public Address:', address);
    console.log('\nAdd this to your .env.local:');
    console.log('NEXT_PUBLIC_SUI_PRIVATE_KEY=' + privateKeyB64);
}

generateAndShowKeys();
