import React from 'react';
import { observer } from 'mobx-react-lite';
import { BlockchainError } from '@/shared/ui/blockchain-error';
import { usePathSymbols } from '../../model/use-path';
import { useBook } from '../../api/book';
import { calculateRelativeSizes } from './utils';
import { RouteBookLoadingRow } from './loading-row';
import { TradeRow } from './trade-row';
import { SpreadRow } from './spread-row';
import { RouteBookHeader } from './header-row';

export const RouteBook = observer(() => {
  const { data, isLoading, error: bookErr } = useBook();

  const multiHops = data?.multiHops;
  const pair = usePathSymbols();

  const sellRelativeSizes = calculateRelativeSizes(multiHops?.sell ?? []);
  const buyRelativeSizes = calculateRelativeSizes(multiHops?.buy ?? []);

  if (bookErr) {
    return (
      <div className='flex min-h-[600px] items-center justify-center p-4'>
        <BlockchainError
          message='An error occurred while loading data from the blockchain'
          direction='column'
        />
      </div>
    );
  }

  if (isLoading || !multiHops) {
    return (
      <div className='mt-2 grid w-full auto-rows-[32px] grid-cols-[1fr_1fr_1fr_1fr] gap-x-2'>
        <RouteBookHeader quote={pair.quoteSymbol} base={pair.baseSymbol} />
        {Array(17)
          .fill(1)
          .map((_, i) => (
            <RouteBookLoadingRow isSpread={i === 8} key={i} />
          ))}
      </div>
    );
  }

  return (
    <div className='mt-2 grid w-full auto-rows-[32px] grid-cols-[1fr_1fr_1fr_1fr] items-center gap-x-2'>
      <RouteBookHeader quote={pair.quoteSymbol} base={pair.baseSymbol} />

      {multiHops.sell.map((trace, idx) => (
        <TradeRow
          key={`${trace.price}-${trace.total}-${idx}`}
          trace={trace}
          isSell={true}
          relativeSize={sellRelativeSizes.get(trace.total) ?? 0}
        />
      ))}

      <SpreadRow sellOrders={multiHops.sell} buyOrders={multiHops.buy} />

      {multiHops.buy.map((trace, idx) => (
        <TradeRow
          key={`${trace.price}-${trace.total}-${idx}`}
          trace={trace}
          isSell={false}
          relativeSize={buyRelativeSizes.get(trace.total) ?? 0}
        />
      ))}
    </div>
  );
});
