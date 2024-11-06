'use client';

import { redirect } from 'next/navigation';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { envQueryFn } from '@/shared/api/env/env.ts';
import { useQuery } from '@tanstack/react-query';
import { assetPatterns } from '@penumbra-zone/types/assets';

const redirectSymbolsQueryFn = async () => {
  const { PENUMBRA_CHAIN_ID } = await envQueryFn();
  const chainRegistryClient = new ChainRegistryClient();
  const registry = await chainRegistryClient.remote.get(PENUMBRA_CHAIN_ID);
  const allAssets = registry
    .getAllAssets()
    .filter(m => !assetPatterns.delegationToken.matches(m.display))
    .toSorted((a, b) => Number(b.priorityScore - a.priorityScore));

  const baseAsset = allAssets[0]?.symbol;
  const quoteAsset = allAssets[1]?.symbol;
  if (!baseAsset || !quoteAsset) {
    throw new Error('Could not find symbols in registry');
  }

  return { baseAsset, quoteAsset };
};

export const RedirectToPair = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['redirectSymbols'],
    retry: 1,
    queryFn: redirectSymbolsQueryFn,
  });

  if (error) {
    return <div className='text-red-600'>{String(error)}</div>;
  } else if (isLoading || !data) {
    return <div className='text-white'>Loading...</div>;
  } else {
    redirect(`/trade/${data.baseAsset}/${data.quoteAsset}`);
  }
};
