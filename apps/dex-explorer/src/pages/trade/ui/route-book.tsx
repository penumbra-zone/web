import React, { useState } from 'react';
import { usePathToMetadata } from '../model/use-path-to-metadata';
import { useBook } from '../api/book';
import { observer } from 'mobx-react-lite';
import { RouteBookResponse, Trace } from '@/shared/api/server/book/types';
import { ChevronRight } from 'lucide-react';

const TabButton = ({ active, children }: { active: boolean; children: React.ReactNode }) => {
  return (
    <button
      className={`h-11 px-2 text-xs font-medium ${
        active
          ? 'text-white border-b-2 border-[#BA4D14] bg-gradient-to-t from-[rgba(186,77,20,0.35)] to-transparent'
          : 'text-gray-400'
      }`}
    >
      {children}
    </button>
  );
};

const HopCount = ({ count }: { count: number }) => {
  return (
    <span className={count === 0 ? 'text-white' : 'text-[#F49C43]'}>
      {count === 0 ? 'Direct' : `${count} ${count === 1 ? 'Hop' : 'Hops'}`}
    </span>
  );
};

const RouteDisplay = ({ tokens }: { tokens: string[] }) => {
  return (
    <div className='flex items-center gap-1 py-2 text-xs text-white'>
      {tokens.map((token, index) => (
        <React.Fragment key={token}>
          {index > 0 && <ChevronRight className='w-3 h-3 text-gray-400' />}
          <span>{token}</span>
        </React.Fragment>
      ))}
    </div>
  );
};

const TradeRow = ({
  trace,
  isSell,
  tokens,
  liquidityPercentage = 50,
  isDirect = false,
}: {
  trace: Trace;
  isSell: boolean;
  tokens: string[];
  liquidityPercentage?: number;
  isDirect?: boolean;
}) => {
  const [showRoute, setShowRoute] = useState(false);
  const bgColor = isSell ? '#AF2626' : '#1C793F';

  return (
    <tr
      className={`group relative h-[33px]  border-b border-[rgba(250,250,250,0.15)]
        ${showRoute ? 'bg-[rgba(250,250,250,0.05)]' : ''}`}
      onMouseEnter={() => setShowRoute(true)}
      onMouseLeave={() => setShowRoute(false)}
    >
      {/*/!* Liquidity progress bar *!/*/}
      {/*<div className='absolute inset-0 p-0'>*/}
      {/*  <div*/}
      {/*    className='absolute inset-0 opacity-24'*/}
      {/*    style={{*/}
      {/*      background: bgColor,*/}
      {/*      right: `${100 - liquidityPercentage}%`,*/}
      {/*    }}*/}
      {/*  />*/}
      {/*</div>*/}

      {showRoute ? (
        <td colSpan={4} className='relative px-4'>
          <RouteDisplay
            tokens={isDirect ? tokens.filter((_, i) => i === 0 || i === tokens.length - 1) : tokens}
          />
        </td>
      ) : (
        <>
          <td
            className={
              isSell ? 'text-[#F17878] text-xs relative' : 'text-[#55D383] text-xs relative'
            }
          >
            {trace.price}
          </td>
          <td className='relative text-xs text-right text-white'>{trace.amount}</td>
          <td className='relative text-xs text-right text-white'>{trace.total}</td>
          <td className='relative text-xs text-right w-14'>
            <HopCount count={isDirect ? 0 : trace.hops.length} />
          </td>
        </>
      )}
    </tr>
  );
};

const SpreadRow = ({ spread }: { spread: { amount: number; percentage: number } }) => {
  return (
    <tr>
      <td colSpan={4} className='border-y border-[#262626]'>
        <div className='flex items-center justify-center gap-2 px-3 py-3 text-xs'>
          <span className='text-[#55D383]'>0.45533225</span>
          <span className='text-gray-400'>Spread:</span>
          <span className='text-white'>{spread.amount} USDC</span>
          <span className='text-gray-400'>({spread.percentage}%)</span>
        </div>
      </td>
    </tr>
  );
};

const RouteBookData = observer(
  ({
    bookData: { singleHops, multiHops },
    pair,
  }: {
    bookData: RouteBookResponse;
    pair: [string, string];
  }) => {
    const tokens = ['UM', 'OSMO', 'SHITMOS', 'USDY', 'USDC'];

    const combineSortTraces = (direct: Trace[], multi: Trace[], isSell: boolean) => {
      const combined = [
        ...direct.map(t => ({ ...t, isDirect: true })),
        ...multi.map(t => ({ ...t, isDirect: false })),
      ];

      return combined.sort((a, b) => {
        const priceA = parseFloat(a.price);
        const priceB = parseFloat(b.price);
        return isSell ? priceB - priceA : priceA - priceB;
      });
    };

    const sellOrders = combineSortTraces(singleHops.sell, multiHops.sell, true);
    const buyOrders = combineSortTraces(singleHops.buy, multiHops.buy, false);

    return (
      <div className='flex flex-col max-w-full  border-y border-[#262626]'>
        <div className='flex items-center gap-2 px-4 h-11 border-b border-[#262626]'>
          <TabButton active={true}>Route Book</TabButton>
          <TabButton active={false}>Route Depth</TabButton>
        </div>

        <div className='flex-1'>
          <table className='w-full'>
            <thead>
              <tr className='text-xs font-normal text-gray-400'>
                <th className='py-[8px] text-left'>Price({pair[0]})</th>
                <th className='py-[8px] text-right'>Amount({pair[1]})</th>
                <th className='py-[8px] text-right'>Total</th>
                <th className='py-[8px] text-right'>Route</th>
              </tr>
            </thead>

            <tbody className='relative'>
              {sellOrders.map((trace, idx) => (
                <TradeRow
                  key={`${trace.price}-${trace.total}-${idx}-${trace.isDirect}`}
                  trace={trace}
                  isSell={true}
                  tokens={tokens}
                  liquidityPercentage={(sellOrders.length - idx) * (100 / sellOrders.length)}
                  isDirect={trace.isDirect}
                />
              ))}

              <SpreadRow spread={{ amount: 0.02, percentage: 0.2 }} />

              {buyOrders.map((trace, idx) => (
                <TradeRow
                  key={`${trace.price}-${trace.total}-${idx}-${trace.isDirect}`}
                  trace={trace}
                  isSell={false}
                  tokens={tokens}
                  liquidityPercentage={(buyOrders.length - idx) * (100 / buyOrders.length)}
                  isDirect={trace.isDirect}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
);

export const RouteBook = observer(() => {
  const { baseAsset, quoteAsset, error: pairError } = usePathToMetadata();
  const {
    data: bookData,
    isLoading: bookIsLoading,
    error: bookErr,
  } = useBook(baseAsset?.symbol, quoteAsset?.symbol);

  if (bookIsLoading || !bookData) {
    return <div className='text-gray-400'>Loading...</div>;
  }

  if (bookErr ?? pairError) {
    return (
      <div className='text-red-500'>Error loading route book: {String(bookErr ?? pairError)}</div>
    );
  }

  return <RouteBookData bookData={bookData} pair={[baseAsset?.symbol, quoteAsset?.symbol]} />;
});

export default RouteBook;
