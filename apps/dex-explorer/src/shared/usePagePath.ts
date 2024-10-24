'use client';

import { useParams, usePathname } from 'next/navigation';
import { PagePath } from './pages';
import { useAssets } from '@/shared/state/assets.ts';
import { useQuery } from '@tanstack/react-query';

const removeTrailingSlash = (url: string): string => {
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

const matchPagePath = (str: string): PagePath => {
  const pathValues = Object.values(PagePath);

  if (pathValues.includes(str as PagePath)) {
    return str as PagePath;
  }

  for (const pathValue of pathValues) {
    if (pathValue.includes(':')) {
      const regex = new RegExp('^' + pathValue.replace(/:(\w+)/g, '([^/]+)') + '$');
      const match = str.match(regex);
      if (match) {
        return pathValue as PagePath;
      }
    }
  }

  throw new Error(`No match found for path: ${str}`);
};

export const usePagePath = <T extends PagePath>() => {
  const pathname = usePathname();
  return matchPagePath(removeTrailingSlash(pathname ?? '')) as T;
};

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
