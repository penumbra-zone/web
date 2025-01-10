import React from 'react';
import { useBook } from '../api/book';
import { observer } from 'mobx-react-lite';
import { RouteBookResponse, Trace } from '@/shared/api/server/book/types';
import { usePathSymbols } from '@/pages/trade/model/use-path.ts';
import { calculateSpread } from '@/pages/trade/model/trace.ts';
import { TradeRow } from '@/pages/trade/ui/trade-row.tsx';
import { Skeleton } from '@/shared/ui/skeleton';
import { BlockchainError } from '@/shared/ui/blockchain-error';

const SkeletonRow = (props: { isSpread: boolean }) =>
  props.isSpread ? (
    <div className='border-y border-y-text-muted'>
      <div className='flex items-center justify-center gap-2 px-3 py-3 text-xs'>
        <div className='w-[78px] h-[16px]'>
          <Skeleton />
        </div>
        <div className='w-[54px] h-[16px]'>
          <Skeleton />
        </div>
        <div className='w-[69px] h-[16px]'>
          <Skeleton />
        </div>
        <div className='w-[39px] h-[16px]'>
          <Skeleton />
        </div>
      </div>
    </div>
  ) : (
    <div className='group relative h-[33px] border-b border-b-other-tonalStroke grid grid-cols-[1fr_1fr_1fr_1fr] items-center'>
      <div className='pl-4'>
        <div className='w-[56px] h-[16px]'>
          <Skeleton />
        </div>
      </div>
      <div className='relative text-xs text-right pl-4'>
        <div className='w-[56px] h-[16px] ml-auto'>
          <Skeleton />
        </div>
      </div>
      <div className='relative text-xs text-right pl-4'>
        <div className='w-[56px] h-[16px] ml-auto'>
          <Skeleton />
        </div>
      </div>
      <div className='relative text-xs text-right pl-4'>
        <div className='w-[24px] h-[16px] ml-auto'>
          <Skeleton />
        </div>
      </div>
    </div>
  );

const RouteBookData = observer(({ bookData }: { bookData?: RouteBookResponse }) => {
  const multiHops = bookData?.multiHops;
  const pair = usePathSymbols();

  const sellRelativeSizes = calculateRelativeSizes(multiHops?.sell ?? []);
  const buyRelativeSizes = calculateRelativeSizes(multiHops?.buy ?? []);

  return (
    <div className='w-full'>
      {/* Header */}
      <div className='grid grid-cols-[1fr_1fr_1fr_1fr] h-[33px] mt-1 text-xs text-gray-400 px-4'>
        <div className='py-2 font-normal text-left'>Price({pair.quoteSymbol})</div>
        <div className='py-2 font-normal text-right'>Amount({pair.baseSymbol})</div>
        <div className='py-2 font-normal text-right'>Total</div>
        <div className='py-2 font-normal text-right'>Route</div>
      </div>

      {/* Body */}
      <div className='relative'>
        {multiHops ? (
          <>
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
          </>
        ) : (
          Array(17)
            .fill(1)
            .map((_, i) => <SkeletonRow isSpread={i === 8} key={i} />)
        )}
      </div>
    </div>
  );
});

export const RouteBook = observer(() => {
  const { data, error: bookErr } = useBook();

  if (bookErr) {
    return (
      <div className='flex items-center justify-center p-4 min-h-[600px]'>
        <BlockchainError
          message='An error occurred while loading data from the blockchain'
          direction='column'
        />
      </div>
    );
  }

  return <RouteBookData bookData={data} />;
});

function formatPrice(price: string): string {
  const num = parseFloat(price);
  const [whole] = num.toString().split('.');
  const totalDigits = 7;
  const availableDecimals = Math.max(0, totalDigits - (whole?.length ?? 0));
  return num.toFixed(availableDecimals);
}

function formatNumber(value: string): string {
  const num = parseFloat(value);
  const [whole] = num.toString().split('.');
  const totalDigits = 6;
  const availableDecimals = Math.max(0, totalDigits - (whole?.length ?? 0));
  return num.toFixed(availableDecimals);
}

const SpreadRow = ({ sellOrders, buyOrders }: { sellOrders: Trace[]; buyOrders: Trace[] }) => {
  const spreadInfo = calculateSpread(sellOrders, buyOrders);
  const pair = usePathSymbols();

  if (!spreadInfo) {
    return null;
  }

  return (
    <div className='border-b border-y-other-solidStroke'>
      <div className='flex items-center justify-center gap-2 px-3 py-3 text-xs'>
        <span className='text-green-400'>{formatPrice(spreadInfo.midPrice)}</span>
        <span className='text-gray-400'>Spread:</span>
        <span className='text-white'>
          {formatNumber(spreadInfo.amount)} {pair.quoteSymbol}
        </span>
        <span className='text-gray-400'>({parseFloat(spreadInfo.percentage).toFixed(2)}%)</span>
      </div>
    </div>
  );
};

const calculateRelativeSizes = (orders: Trace[]): Map<string, number> => {
  if (!orders.length) {
    return new Map();
  }

  const totals = orders.map(order => parseFloat(order.total));
  const maxTotal = Math.max(...totals);

  return totals.reduce((map, total) => {
    const percentage = (total / maxTotal) * 100;
    map.set(total.toString(), percentage);
    return map;
  }, new Map<string, number>());
};

export default RouteBook;
