import { useAssets } from '@/shared/api/assets';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

interface PathParams {
  baseSymbol: string;
  quoteSymbol: string;
  [key: string]: string; // required for useParams signature
}

export const usePathSymbols = () => {
  const params = useParams<PathParams>();
  if (!params) {
    throw new Error('No symbol params in path');
  }
  return { baseSymbol: params.baseSymbol, quoteSymbol: params.quoteSymbol };
};

// Converts symbol to Metadata
export const usePathToMetadata = () => {
  const { data, error, isLoading } = useAssets();
  const { baseSymbol, quoteSymbol } = usePathSymbols();

  const baseSymbolNormalized = baseSymbol.toUpperCase();
  const quoteSymbolNormalized = quoteSymbol.toUpperCase();

  const query = useQuery({
    queryKey: ['pathToMetadata', data, baseSymbol, quoteSymbol],
    queryFn: () => {
      return {
        baseAsset: data?.find(m => m.symbol === baseSymbolNormalized),
        quoteAsset: data?.find(a => a.symbol === quoteSymbolNormalized),
      };
    },
  });

  return {
    ...query,
    baseAsset: query.data?.baseAsset,
    quoteAsset: query.data?.quoteAsset,
    isLoading: isLoading || query.isLoading,
    error: error ?? query.error,
  };
};
