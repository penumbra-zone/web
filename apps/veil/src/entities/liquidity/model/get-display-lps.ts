import { LpPositionBundleResponse } from '../api/use-lps';

export interface DisplayLP {
  date: string;
  liquidityShape: string;
  tradingPair: string;
  status: string;
}

export const getDisplayLPs = ({
  positionBundles,
}: {
  positionBundles: LpPositionBundleResponse[];
}) => {
  return positionBundles.map(bundle => {
    return {
      ...bundle,
    };
  });
};
