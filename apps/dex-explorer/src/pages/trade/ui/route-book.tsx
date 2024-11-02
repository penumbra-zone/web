import React, {useState} from 'react';
import {usePathToMetadata} from '../model/use-path-to-metadata';
import {useBook} from '../api/book';
import {observer} from 'mobx-react-lite';
import {RouteBookResponse, Trace} from '@/shared/api/server/book/types';
import {
  getSymbolFromValueView,
} from '@penumbra-zone/getters/value-view';

const TabButton = ({active, children}: { active: boolean; children: React.ReactNode }) => {
  return (
    <button
      className={`px-4 py-2 ${
        active
          ? 'text-white border-b-2 border-orange-500'
          : 'text-gray-400'
      }`}
    >
      {children}
    </button>
  );
};

const HopCount = ({count}: { count: number }) => {
  return count === 0
    ? <span className="text-white">Direct</span>
    : <span className="text-orange-400">{count} {count === 1 ? 'Hop' : 'Hops'}</span>;
};

const PathDisplay = ({hops}: { hops: string[] }) => {
  return (
    <div className="py-2 px-4 text-gray-400 text-sm">
      {hops.join(' → ')}
    </div>
  );
};

const SpreadInfo = ({spread}: { spread: { amount: number; percentage: number } }) => {
  return (
    <div className="py-3 px-4 border-t border-b border-gray-800">
      <span className="text-green-400">0.45533225</span>
      <span className="text-gray-400 ml-2">
        Spread: {spread.amount} USDC ({spread.percentage}%)
      </span>
    </div>
  );
};

const RouteBookLoadingState = () => {
  return (
    <div className="text-gray-500">Loading...</div>
  );
};

const TradeRow = ({
                    trace,
                    isSell,
                    hops
                  }: {
  trace: Trace;
  isSell: boolean;
  hops: string[];
}) => {
  const [showRoute, setShowRoute] = useState(false);

  return (
    <>
      <tr
        className={`${isSell ? 'bg-red-950/30' : 'bg-green-950/30'} relative`}
        onMouseEnter={() => setShowRoute(true)}
        onMouseLeave={() => setShowRoute(false)}
      >
        <td className="p-4 text-left tabular-nums">{trace.price}</td>
        <td className="p-4 text-right tabular-nums">{trace.amount}</td>
        <td className="p-4 text-right tabular-nums">{trace.total}</td>
        <td className="p-4 text-right">
          <HopCount count={trace.hops.length}/>
        </td>
      </tr>
      {showRoute && (
        <tr className="absolute left-0 right-0 bg-gray-900 shadow-lg">
          <td colSpan={4}>
            <PathDisplay hops={hops}/>
          </td>
        </tr>
      )}
    </>
  );
};

const RouteBookData = observer(({bookData: {multiHops}}: { bookData: RouteBookResponse }) => {
  return (
    <div className="bg-black min-h-[512px] text-white">
      <div className="border-b border-gray-800">
        <TabButton active={true}>Route Book</TabButton>
        <TabButton active={false}>Route Depth</TabButton>
      </div>

      <div className="divide-y divide-gray-800">
        <table className="w-full">
          <thead className="text-gray-400">
          <tr>
            <th className="text-left p-4">Price(USDC)</th>
            <th className="text-right p-4">Amount(UM)</th>
            <th className="text-right p-4">Total</th>
            <th className="text-right p-4">Route</th>
          </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
          {multiHops.sell.map((trace, idx) => {
            return (
              <TradeRow
                key={trace.price + trace.total + idx}
                trace={trace}
                isSell={true}
                hops={trace.hops.map(hop => getSymbolFromValueView(hop))}
              />
            );
          })}
          </tbody>
        </table>

        <SpreadInfo spread={{amount: 0.02, percentage: 0.2}}/>

        <table className="w-full">
          <tbody className="divide-y divide-gray-800">
          {multiHops.buy.map((trace, idx) => {
            return (
              <TradeRow
                key={trace.price + trace.total + idx}
                trace={trace}
                isSell={false}
                hops={trace.hops.map(hop => getSymbolFromValueView(hop))}
              />
            );
          })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export const RouteBook = observer(() => {
  const {baseAsset, quoteAsset, error: pairError} = usePathToMetadata();
  const {
    data: bookData,
    isLoading: bookIsLoading,
    error: bookErr,
  } = useBook(baseAsset?.symbol, quoteAsset?.symbol);

  if (bookIsLoading || !bookData) {
    return <RouteBookLoadingState/>;
  }

  if (bookErr ?? pairError) {
    return (
      <div className="text-red-500">
        Error loading route book: {String(bookErr ?? pairError)}
      </div>
    );
  }

  return <RouteBookData bookData={bookData}/>;
});

export default RouteBook;
