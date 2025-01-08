import React from 'react';
import { useMarketPrice } from '../model/useMarketPrice';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { LoadingCell } from './market-trades';
import { pnum } from '@penumbra-zone/types/pnum';
import { DisplayAsset } from '../model/positions';

export const PositionsCurrentValue = ({
  baseAsset,
  quoteAsset,
}: {
  baseAsset: DisplayAsset;
  quoteAsset: DisplayAsset;
}) => {
  const marketPrice = useMarketPrice(baseAsset.asset.symbol, quoteAsset.asset.symbol);

  return marketPrice ? (
    <ValueViewComponent
      valueView={pnum(marketPrice, quoteAsset.exponent).toValueView(quoteAsset.asset)}
      density='slim'
    />
  ) : (
    <LoadingCell />
  );
};
