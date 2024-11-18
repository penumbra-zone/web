import React, { useState } from 'react';
import { useBook } from '../api/book';
import { observer } from 'mobx-react-lite';
import { RouteBookResponse, Trace } from '@/shared/api/server/book/types';
import { usePathSymbols } from '@/pages/trade/model/use-path.ts';
import { Tabs } from '@penumbra-zone/ui/Tabs';
import { calculateSpread } from '@/pages/trade/model/trace.ts';
import { TradeRow } from '@/pages/trade/ui/trade-row.tsx';

export const ROUTEBOOK_TABS = [
  { label: 'Route book', value: 'routes' },
  { label: 'Route Depth', value: 'depth' },
];

const SkeletonRow = (props: { isSpread: boolean }) =>
  props.isSpread ? (
    <tr>
      <td colSpan={4} className='border-y border-border-base'>
        <div className='flex items-center justify-center gap-2 px-3 py-3 text-xs'>
          <div className='w-full h-[22px] bg-neutral-800 rounded animate-pulse ml-auto'></div>

          <div className='w-full h-[22px] bg-neutral-800 rounded animate-pulse ml-auto'></div>

          <div className='w-full h-[22px] bg-neutral-800 rounded animate-pulse ml-auto'></div>

          <div className='w-full h-[22px] bg-neutral-800 rounded animate-pulse ml-auto'></div>
        </div>
      </td>
    </tr>
  ) : (
    <tr className={`group relative h-[33px] border-b border-border-faded`}>
      <td>
        <div className='w-full h-[22px] bg-neutral-800 rounded animate-pulse ml-auto'></div>
      </td>
      <td className='relative text-xs text-right text-white'>
        <div className='w-full h-[22px] bg-neutral-800 rounded animate-pulse ml-auto'></div>
      </td>
      <td className='relative text-xs text-right text-white'>
        <div className='w-full h-[22px] bg-neutral-800 rounded animate-pulse ml-auto'></div>
      </td>
      <td className='relative text-xs text-right'>
        <div className='w-full h-[22px] bg-neutral-800 rounded animate-pulse ml-auto'></div>
      </td>
    </tr>
  );

const RouteBookData = observer(({ bookData }: { bookData?: RouteBookResponse }) => {
  const multiHops = bookData?.multiHops;
  const pair = usePathSymbols();
  const [activeTab, setActiveTab] = useState('routes');

  const sellRelativeSizes = calculateRelativeSizes(multiHops?.sell ?? []);
  const buyRelativeSizes = calculateRelativeSizes(multiHops?.buy ?? []);

  return (
    <div className='flex flex-col max-w-full border-y border-border-base'>
      <div className='flex items-center gap-2 px-4 h-11 border-b border-border-base'>
        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          options={ROUTEBOOK_TABS}
          actionType='accent'
        />
      </div>
      <div className='flex-1'>
        {activeTab === 'routes' ? (
          <table className='w-full'>
            <thead>
              <tr className='text-xs text-gray-400'>
                <th className='py-2 font-normal text-left'>Price({pair.quoteSymbol})</th>
                <th className='py-2 font-normal text-right'>Amount({pair.baseSymbol})</th>
                <th className='py-2 font-normal text-right'>Total</th>
                <th className='py-2 font-normal text-right'>Route</th>
              </tr>
            </thead>

            <tbody className='relative'>
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
            </tbody>
          </table>
        ) : (
          <div className='flex items-center justify-center h-full text-gray-400'>
            Coming soon...
          </div>
        )}
      </div>
    </div>
  );
});

export const RouteBook = observer(() => {
  const { data, error: bookErr } = useBook();

  if (bookErr) {
    return <div className='text-red-500'>Error loading route book: {String(bookErr)}</div>;
  }

  return <RouteBookData bookData={data} />;
});

const SpreadRow = ({ sellOrders, buyOrders }: { sellOrders: Trace[]; buyOrders: Trace[] }) => {
  const spreadInfo = calculateSpread(sellOrders, buyOrders);
  const pair = usePathSymbols();

  if (!spreadInfo) {
    return;
  }

  return (
    <tr>
      <td colSpan={4} className='border-y border-border-base'>
        <div className='flex items-center justify-center gap-2 px-3 py-3 text-xs'>
          <span className='text-green-400'>{parseFloat(spreadInfo.midPrice)}</span>
          <span className='text-gray-400'>Spread:</span>
          <span className='text-white'>
            {parseFloat(spreadInfo.amount)} {pair.quoteSymbol}
          </span>
          <span className='text-gray-400'>({spreadInfo.percentage}%)</span>
        </div>
      </td>
    </tr>
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
