import { NextResponse, NextRequest } from 'next/server';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { getClientSideEnv } from '@/shared/api/env/getClientSideEnv';
import { assetPatterns } from '@penumbra-zone/types/assets';

export const routingMiddleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    // Redirect the default homepage to the 'explore' page.
    // TODO: Replace this with a path to a fully designed landing page.
    return NextResponse.redirect(new URL(`/explore`, request.url));
  }

  // Otherwise, route to the default trading pair on the trading page.
  if (pathname === '/trade') {
    const { PENUMBRA_CHAIN_ID } = getClientSideEnv();
    const chainRegistryClient = new ChainRegistryClient();
    const registry = await chainRegistryClient.remote.get(PENUMBRA_CHAIN_ID);
    const allAssets = registry
      .getAllAssets()
      .filter(m => !assetPatterns.delegationToken.matches(m.display))
      .toSorted((a, b) => Number(b.priorityScore - a.priorityScore));

    const baseAsset = allAssets[0]?.symbol;
    const quoteAsset = allAssets[1]?.symbol;
    if (!baseAsset || !quoteAsset) {
      return NextResponse.redirect(new URL('not-found', request.url));
    }

    return NextResponse.redirect(new URL(`/trade/${baseAsset}/${quoteAsset}`, request.url));
  }

  return NextResponse.next();
};
