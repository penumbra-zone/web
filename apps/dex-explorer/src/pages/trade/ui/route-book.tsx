import { useBook } from '../api/book';
import { observer } from 'mobx-react-lite';
import { RouteBookResponse } from '@/shared/api/server/book/types';

const RouteBookLoadingState = () => {
  return (
    <div>
      <div className='text-gray-500'>Loading...</div>
    </div>
  );
};

const RouteBookData = observer(({ bookData: { multiHops } }: { bookData: RouteBookResponse }) => {
  return (
    <div className='h-[512px] text-white'>
      <table className='w-full'>
        <thead>
          <tr>
            <th>Price</th>
            <th className='text-right'>Amount</th>
            <th className='text-right'>Total</th>
            <th className='text-right'>Hops</th>
          </tr>
        </thead>
        <tbody>
          {multiHops.sell.map(trace => (
            <tr key={trace.price + trace.total} style={{ color: 'red' }}>
              <td className='text-left tabular-nums'>{trace.price}</td>
              <td className='text-right tabular-nums'>{trace.amount}</td>
              <td className='text-right tabular-nums'>{trace.total}</td>
              <td className='text-right tabular-nums'>{trace.hops.length}</td>
            </tr>
          ))}
          {multiHops.buy.map(trace => (
            <tr key={trace.price + trace.total} style={{ color: 'green' }}>
              <td className='text-left tabular-nums'>{trace.price}</td>
              <td className='text-right tabular-nums'>{trace.amount}</td>
              <td className='text-right tabular-nums'>{trace.total}</td>
              <td className='text-right tabular-nums'>{trace.hops.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export const RouteBook = observer(() => {
  const { data, isLoading, error } = useBook();

  if (error) {
    return <div>Error loading route book: ${String(error)}</div>;
  }

  if (isLoading || !data) {
    return <RouteBookLoadingState />;
  }

  return <RouteBookData bookData={data} />;
});
