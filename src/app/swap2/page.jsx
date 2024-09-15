"use client"

import { createJupiterApiClient } from '@jup-ag/api';
import React, { useState, useEffect } from 'react';

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

async function getSwapQuotes(tokenAllocations) {
    try {
        const jupiterApi = await createJupiterApiClient();

        const quotePromises = tokenAllocations.map(async ({ mint, amount }) => {
            try {
                const quote = await jupiterApi.quoteGet({
                    inputMint: USDC_MINT,
                    outputMint: mint,
                    amount: Math.floor(amount * 1000000), // 
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
    const [tokens, setTokens] = useState([{ mint: '', allocation: '' }]);
    const [quoteResults, setQuoteResults] = useState(null);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const totalAllocation = tokens.reduce((sum, token) => sum + Number(token.allocation), 0);
        if (totalAllocation > 100) {
            alert("Total allocation exceeds 100%");
        }
    }, [tokens]);

    const handleAddToken = () => {
        setTokens([...tokens, { mint: '', allocation: '' }]);
    };

    const handleTokenChange = (index, field, value) => {
        const newTokens = [...tokens];
        newTokens[index][field] = value;
        setTokens(newTokens);
    };

    const handleRemoveToken = (index) => {
        const newTokens = tokens.filter((_, i) => i !== index);
        setTokens(newTokens);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const totalAllocation = tokens.reduce((sum, token) => sum + Number(token.allocation), 0);
        if (totalAllocation !== 100) {
            alert("Total allocation must equal 100%");
            return;
        }

        const tokenAllocations = tokens.map(token => ({
            mint: token.mint,
            amount: (Number(totalUsdcAmount) * Number(token.allocation)) / 100
        }));

        const quotes = await getSwapQuotes(tokenAllocations);
        setQuoteResults(quotes);
    };

    const filteredQuotes = quoteResults?.filter(quote => 
        quote.mint.toLowerCase().includes(filter.toLowerCase())
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
                {tokens.map((token, index) => (
                    <div key={index} className="flex items-center space-x-3">
                        <input
                            type="text"
                            placeholder="Token Mint Address"
                            value={token.mint}
                            onChange={(e) => handleTokenChange(index, 'mint', e.target.value)}
                            className="flex-grow px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Allocation %"
                            value={token.allocation}
                            onChange={(e) => handleTokenChange(index, 'allocation', e.target.value)}
                            className="w-28 px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                            required
                        />
                        <button 
                            type="button" 
                            onClick={() => handleRemoveToken(index)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            Remove
                        </button>
                    </div>
                ))}
                <div className="flex justify-between">
                    <button 
                        type="button" 
                        onClick={handleAddToken}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                        Add Token
                    </button>
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
                        placeholder="Filter by token mint"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full px-4 py-3 mb-6 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                    />
                    <ul className="space-y-6">
                        {filteredQuotes.map(({ mint, quote }, index) => (
                            <li key={index} className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl shadow-md transition duration-300 ease-in-out hover:shadow-lg">
                                <div className="flex justify-between items-center mb-3">
                                    <strong className="text-xl text-indigo-700">Token Mint: {mint}</strong>
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