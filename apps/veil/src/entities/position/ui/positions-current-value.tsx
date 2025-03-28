import { useMarketPrice } from '@/pages/trade/model/useMarketPrice';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { pnum } from '@penumbra-zone/types/pnum';
import { Skeleton } from '@penumbra-zone/ui/Skeleton';
import { DisplayPosition } from '../model/types';

export const PositionsCurrentValue = ({ order }: { order: DisplayPosition['orders'][number] }) => {
  const { baseAsset, quoteAsset } = order;
  const marketPrice = useMarketPrice(baseAsset.asset.symbol, quoteAsset.asset.symbol);

  if (!marketPrice) {
    return (
      <div className='w-12 h-4'>
        <Skeleton />
      </div>
    );
  }

  if (order.direction === 'Buy') {
    return (
      <ValueViewComponent
        valueView={pnum(quoteAsset.amount.toNumber(), quoteAsset.exponent).toValueView(
          quoteAsset.asset,
        )}
      />
    );
  }

  const computedValue = baseAsset.amount.toNumber() * marketPrice;
  if (!Number.isFinite(computedValue)) {
    return (
      <div className='w-12 h-4'>
        <Skeleton />
      </div>
    );
  }

  return (
    <ValueViewComponent
      valueView={pnum(computedValue, quoteAsset.exponent).toValueView(quoteAsset.asset)}
    />
  );
};
