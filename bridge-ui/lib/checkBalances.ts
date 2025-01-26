import { SuiClient } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';

export async function checkBridgeRequirements(suiClient: SuiClient) {
  try {
    // Check if all required env variables are present
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUI_PACKAGE_ID',
      'NEXT_PUBLIC_ADMIN_ADDRESS',
      'NEXT_PUBLIC_SUI_PRIVATE_KEY',
      'NEXT_PUBLIC_BRIDGE_ADDRESS',
      'NEXT_PUBLIC_ETH_TOKEN_ADDRESS'
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing environment variable: ${envVar}`);
      }
    }

    // Check if admin has sufficient gas
    const keypair = Ed25519Keypair.fromSecretKey(
      Buffer.from(process.env.NEXT_PUBLIC_SUI_PRIVATE_KEY as string, 'base64')
    );
    const adminAddress = keypair.getPublicKey().toSuiAddress();

    const balance = await suiClient.getBalance({
      owner: adminAddress,
      coinType: '0x2::sui::SUI'
    });

    if (BigInt(balance.totalBalance) < BigInt(1e8)) { // 0.1 SUI minimum
      throw new Error('Insufficient SUI balance for gas fees');
    }

    // Check if AdminCap exists
    const adminCaps = await suiClient.getOwnedObjects({
      owner: process.env.NEXT_PUBLIC_ADMIN_ADDRESS as string,
      filter: {
        StructType: `${process.env.NEXT_PUBLIC_SUI_PACKAGE_ID}::bridge::BridgeAdmin`
      }
    });

    if (!adminCaps.data[0]?.data?.objectId) {
      throw new Error('AdminCap not found');
    }

    return true;
  } catch (error) {
    console.error('Bridge requirements check failed:', error);
    return false;
  }
} 