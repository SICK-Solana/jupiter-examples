'use client';

import { FC, useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

const WalletInfo: FC = () => {
  const { publicKey } = useWallet(); // Get the connected wallet's public key
  const { connection } = useConnection(); // Get the connection to the Solana network

  const [balance, setBalance] = useState<number | null>(null); // Store the balance

  // Function to fetch balance
  const fetchBalance = async (publicKey: PublicKey) => {
    try {
      const balanceInLamports = await connection.getBalance(publicKey); // Fetch balance in lamports (smallest unit)
      setBalance(balanceInLamports / 1e9); 
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  useEffect(() => {
    if (publicKey) {
      fetchBalance(publicKey); // Fetch balance when a wallet is connected
    }
  }, [publicKey, connection]);

  return (
    <div>
      {publicKey ? (
        <div>
          <p><strong>Wallet Address:</strong> {publicKey.toBase58()}</p>
          <p><strong>Balance:</strong> {balance !== null ? `${balance} SOL` : 'Loading...'}</p>
        </div>
      ) : (
        <p>Please connect your wallet.</p>
      )}
    </div>
  );
};

export default WalletInfo;
