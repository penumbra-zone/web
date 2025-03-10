import { usePagePath } from '@/shared/utils/usePagePath.ts';

export enum PagePath {
  Home = '',
  Explore = '/explore',
  Trade = '/trade',
  Inspect = '/inspect',
  Portfolio = '/portfolio',
  TradePair = '/trade/:primary/:numeraire',
  InspectLp = '/inspect/lp/:id',
  LpLeaderboard = '/inspect/lp-leaderboard',
}

const basePath: Partial<Record<PagePath, PagePath>> = {
  [PagePath.TradePair]: PagePath.Trade,
  '/inspect/lp/:id': PagePath.Inspect,
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
