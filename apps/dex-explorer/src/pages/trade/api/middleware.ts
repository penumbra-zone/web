import { NextResponse, NextRequest } from 'next/server';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { getClientSideEnv } from '@/shared/api/env/getClientSideEnv';
import { assetPatterns } from '@penumbra-zone/types/assets';

export const tradeMiddleware = async (request: NextRequest) => {
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
};
