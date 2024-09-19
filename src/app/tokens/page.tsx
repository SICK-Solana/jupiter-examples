"use client"
import { useEffect, useState } from 'react';

export default function TokensPage() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [totalTokens, setTotalTokens] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await fetch('/api/getAlltokens');
        if (!response.ok) {
          throw new Error(`Error fetching tokens: ${response.statusText}`);
        }
        const data = await response.json();
        setTotalTokens(data.totalTokens);
        setTokens(data.first100Tokens);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Something went wrong');
      }
    };

    fetchTokens();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Jupiter Tokens</h1>
      <p className="text-xl mb-6">Total Tokens: {totalTokens}</p>

      <div className="overflow-x-auto">
        <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">Logo</th>
              <th className="px-6 py-3 text-left">Symbol</th>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Address</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token) => (
              <tr key={token.address} className="border-b border-gray-700 hover:bg-gray-600 transition-colors">
                <td className="px-6 py-4">
                  {token.logoURI ? (
                    <img
                      src={token.logoURI}
                      alt={token.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4">{token.symbol}</td>
                <td className="px-6 py-4">{token.name}</td>
                <td className="px-6 py-4 font-mono text-sm">{token.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
