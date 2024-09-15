"use client"

import { createJupiterApiClient } from '@jup-ag/api';
import React, { useState  } from 'react';

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const WRAPPED_ETH_MINT = "2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk";
const BONK_MINT = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263";

async function getSwapQuotes(usdcAmount) {
    try {
        const jupiterApi = await createJupiterApiClient();
        const usdcAmountPerToken = Math.floor(usdcAmount / 2);

        const quotePromises = [WRAPPED_ETH_MINT, BONK_MINT].map(async (tokenMint) => {
            try {
                const quote = await jupiterApi.quoteGet({
                    inputMint: USDC_MINT,
                    outputMint: tokenMint,
                    amount: usdcAmountPerToken,
                });
                return { tokenMint, quote };
            } catch (error) {
                console.error(`Error getting quote for token ${tokenMint}:`, error);
                return null;
            }
        });

        const results = await Promise.all(quotePromises);
        return results.filter(result => result !== null);
    } catch (error) {
        throw new Error("Error fetching swap quotes.");
    }
}

export default function BalancedSwapPage() {
   
    const [usdcAmount, setUsdcAmount] = useState('');
    const [quoteResults, setQuoteResults] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const quotes = await getSwapQuotes(parseInt(usdcAmount * 1000000)); // Convert USDC to smallest unit
        setQuoteResults(quotes);
    };

    return (
        <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
                <h1 className="text-3xl font-bold text-white">Balanced USDC Swap</h1>
            </div>
            <div className="p-6">
                <form onSubmit={handleSubmit} className="mb-6">
                    <div className="mb-4">
                        <label htmlFor="usdcAmount" className="block text-sm font-medium text-gray-700 mb-2">Amount of USDC to swap</label>
                        <input
                            type="number"
                            id="usdcAmount"
                            value={usdcAmount}
                            onChange={(e) => setUsdcAmount(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ease-in-out">
                        Get Swap Quotes
                    </button>
                </form>

                {quoteResults && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Swap Results</h2>
                        <ul className="space-y-4">
                            {quoteResults.map(({ tokenMint, quote }, index) => (
                                <li key={index} className="bg-white p-4 rounded-md shadow">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-700">{tokenMint === WRAPPED_ETH_MINT ? 'Wrapped ETH' : 'BONK'}</span>
                                        <span className="text-sm text-gray-500">For {(usdcAmount / 2).toFixed(2)} USDC</span>
                                    </div>
                                    <div className="mt-2 text-lg font-semibold text-indigo-600">
                                        {(quote.outAmount / 1e9).toFixed(6)} Tokens
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}