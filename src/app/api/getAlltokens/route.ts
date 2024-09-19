// app/api/jupiter-tokens/route.ts

import { NextResponse } from 'next/server';

async function fetchAllJupiterTokens() {
  const url = 'https://token.jup.ag/all';
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const tokens = await response.json();
  return tokens;
}

export async function GET() {
  try {
    const tokens = await fetchAllJupiterTokens();
    
    if (!tokens) {
      return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 });
    }

    const first100Tokens = tokens.slice(0, 100);

    return NextResponse.json({
      totalTokens: tokens.length,
      first100Tokens: first100Tokens
    });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}