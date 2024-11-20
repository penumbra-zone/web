import { HeaderCell, LoadingCell } from './market-trades';

const LoadingRow = () => {
  return (
    <div className='grid grid-cols-subgrid col-span-10 text-text-secondary border-b border-other-tonalStroke'>
      <LoadingCell />
      <LoadingCell />
      <LoadingCell />
      <LoadingCell />
      <LoadingCell />
      <LoadingCell />
      <LoadingCell />
      <LoadingCell />
      <LoadingCell />
      <LoadingCell />
    </div>
  );
};

export const History = () => {
  return (
    <div className='pt-4 px-4 pb-0 overflow-hidden'>
      <div className='grid grid-cols-[repeat(10,1fr)] h-auto overflow-auto'>
        <div className='grid grid-cols-subgrid sticky top-0 z-10 col-span-10 text-text-secondary border-b border-other-tonalStroke bg-app-main'>
          <HeaderCell>Time</HeaderCell>
          <HeaderCell>Pair</HeaderCell>
          <HeaderCell>Tx Type</HeaderCell>
          <HeaderCell>Order Type</HeaderCell>
          <HeaderCell>Side</HeaderCell>
          <HeaderCell>Amount</HeaderCell>
          <HeaderCell>Price</HeaderCell>
          <HeaderCell>Status</HeaderCell>
          <HeaderCell>Gas Fee</HeaderCell>
          <HeaderCell>Position ID</HeaderCell>
        </div>

        {new Array(15).fill(0).map((_, i) => (
          <LoadingRow key={i} />
        ))}
      </div>
    </div>
  );
};
