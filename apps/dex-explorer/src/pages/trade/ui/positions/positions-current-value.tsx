import React from 'react';
import { useMarketPrice } from '../../model/useMarketPrice';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { LoadingCell } from './cell';
import { pnum } from '@penumbra-zone/types/pnum';
import { DisplayPosition } from '../../model/positions';

export const PositionsCurrentValue = ({ order }: { order: DisplayPosition['orders'][number] }) => {
  const { baseAsset, quoteAsset } = order;
  const marketPrice = useMarketPrice(baseAsset.asset.symbol, quoteAsset.asset.symbol);

  if (!marketPrice) {
    return <LoadingCell />;
  }

  if (order.direction === 'Buy') {
    return (
      <ValueViewComponent
        valueView={pnum(quoteAsset.amount.toNumber(), quoteAsset.exponent).toValueView(
          quoteAsset.asset,
        )}
        density='slim'
      />
    );
  }

  return (
    <ValueViewComponent
      valueView={pnum(baseAsset.amount.toNumber() * marketPrice, quoteAsset.exponent).toValueView(
        quoteAsset.asset,
      )}
      density='slim'
    />
  );
};
