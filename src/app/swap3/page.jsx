"use client"

import React, { useState, useEffect } from 'react';
import { createJupiterApiClient } from '@jup-ag/api';

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

// Predefined list of tokens with their mint addresses
const TOKENS = [
  { name: 'Solana', mint: 'So11111111111111111111111111111111111111112' },
  { name: 'Raydium', mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R' },
  { name: 'Serum', mint: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt' },
  { name: 'Star Atlas', mint: 'ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx' },
  // Add more tokens as needed
];

async function getSwapQuotes(tokenAllocations) {
  try {
    const jupiterApi = await createJupiterApiClient();

    const quotePromises = tokenAllocations.map(async ({ mint, amount }) => {
      try {
        const quote = await jupiterApi.quoteGet({
          inputMint: USDC_MINT,
          outputMint: mint,
          amount: Math.floor(amount * 1000000),
        });
        return { mint, quote };
      } catch (error) {
        console.error(`Error getting quote for token ${mint}:`, error);
        return null;
      }
    });

    const results = await Promise.all(quotePromises);
    return results.filter(result => result !== null);
  } catch (error) {
    throw new Error("Error fetching swap quotes.");
  }
}

export default function CustomTokenBasketSwap() {
  const [totalUsdcAmount, setTotalUsdcAmount] = useState('');
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [quoteResults, setQuoteResults] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const totalAllocation = selectedTokens.reduce((sum, token) => sum + Number(token.allocation), 0);
    if (totalAllocation > 100) {
      alert("Total allocation exceeds 100%");
    }
  }, [selectedTokens]);

  const handleTokenSelection = (token) => {
    const isSelected = selectedTokens.some(t => t.mint === token.mint);
    if (isSelected) {
      setSelectedTokens(selectedTokens.filter(t => t.mint !== token.mint));
    } else {
      setSelectedTokens([...selectedTokens, { ...token, allocation: '' }]);
    }
  };

  const handleAllocationChange = (mint, allocation) => {
    setSelectedTokens(selectedTokens.map(token => 
      token.mint === mint ? { ...token, allocation } : token
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const totalAllocation = selectedTokens.reduce((sum, token) => sum + Number(token.allocation), 0);
    if (totalAllocation !== 100) {
      alert("Total allocation must equal 100%");
      return;
    }

    const tokenAllocations = selectedTokens.map(token => ({
      mint: token.mint,
      amount: (Number(totalUsdcAmount) * Number(token.allocation)) / 100
    }));

    const quotes = await getSwapQuotes(tokenAllocations);
    setQuoteResults(quotes);
  };

  const filteredQuotes = quoteResults?.filter(quote => 
    TOKENS.find(token => token.mint === quote.mint)?.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-indigo-100 to-purple-100 shadow-2xl rounded-2xl">
      <h1 className="text-4xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Custom Token Basket Swap</h1>
      <form onSubmit={handleSubmit} className="mb-8 space-y-6">
        <div>
          <label htmlFor="usdcAmount" className="block text-sm font-medium text-gray-700 mb-2">Total USDC Amount:</label>
          <input
            type="number"
            id="usdcAmount"
            value={totalUsdcAmount}
            onChange={(e) => setTotalUsdcAmount(e.target.value)}
            className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {TOKENS.map((token) => (
            <div key={token.mint} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={token.mint}
                checked={selectedTokens.some(t => t.mint === token.mint)}
                onChange={() => handleTokenSelection(token)}
                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor={token.mint} className="text-sm font-medium text-gray-700">{token.name}</label>
            </div>
          ))}
        </div>
        {selectedTokens.map((token) => (
          <div key={token.mint} className="flex items-center space-x-3">
            <span className="flex-grow">{TOKENS.find(t => t.mint === token.mint).name}</span>
            <input
              type="number"
              placeholder="Allocation %"
              value={token.allocation}
              onChange={(e) => handleAllocationChange(token.mint, e.target.value)}
              className="w-28 px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
              required
            />
          </div>
        ))}
        <div className="flex justify-end">
          <button 
            type="submit" 
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Get Swap Quotes
          </button>
        </div>
      </form>

      {quoteResults && (
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold mb-6 text-indigo-600">Swap Results</h2>
          <input
            type="text"
            placeholder="Filter by token name"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-3 mb-6 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          />
          <ul className="space-y-6">
            {filteredQuotes.map(({ mint, quote }, index) => (
              <li key={index} className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl shadow-md transition duration-300 ease-in-out hover:shadow-lg">
                <div className="flex justify-between items-center mb-3">
                  <strong className="text-xl text-indigo-700">{TOKENS.find(token => token.mint === mint).name}</strong>
                  <span className="text-sm text-purple-600 font-medium">For {(quote.inAmount / 1e6).toFixed(2)} USDC</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  Estimated Output: {(quote.outAmount / 1e9).toFixed(6)} Tokens
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}