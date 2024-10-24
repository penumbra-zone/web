import { usePagePath } from '@/shared/usePagePath.ts';

export enum PagePath {
  Home = '/v2',
  Explore = '/v2/explore',
  Trade = '/v2/trade',
  Inspect = '/v2/inspect',
  Portfolio = '/v2/portfolio',
  TradePair = '/v2/trade/:primary/:numeraire',
}

const basePath: Partial<Record<PagePath, PagePath>> = {
  [PagePath.TradePair]: PagePath.Trade,
};

// Used for dynamic routing when wanting to exclude the dynamic elements
export const useBasePath = (): PagePath => {
  const path = usePagePath();

  const base = basePath[path];
  if (base) {
    return base;
  }
  return path;
};
