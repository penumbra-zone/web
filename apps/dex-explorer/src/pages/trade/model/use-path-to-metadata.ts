import { useAssets } from '@/shared/api/assets';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

interface PathParams {
  baseSymbol: string;
  quoteSymbol: string;
  [key: string]: string; // required for useParams signature
}

// Converts symbol to Metadata
export const usePathToMetadata = () => {
  const { data, error, isLoading } = useAssets();
  const params = useParams<PathParams>();

  const query = useQuery({
    queryKey: ['pathToMetadata', data, params],
    queryFn: () => {
      return {
        baseAsset: data?.find(a => a.symbol === params?.baseSymbol),
        quoteAsset: data?.find(a => a.symbol === params?.quoteSymbol),
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
