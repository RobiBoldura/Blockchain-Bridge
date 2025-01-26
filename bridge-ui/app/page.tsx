'use client';

import WalletConnect from '@/components/WalletConnect';
import BridgeForm from '@/components/BridgeForm';
import TokenBalance from '@/components/TokenBalance';

export default function Page() {
  return (
    <main className="p-8 bg-gray-100 centered-container">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          IBT Token Bridge
        </h1>

        {/* Content Sections */}
        <div className="space-y-8">
          <BridgeForm />
          <TokenBalance />
          <WalletConnect />
        </div>
      </div>
    </main>
  );
}
