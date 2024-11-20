import { HeaderCell, LoadingCell } from './market-trades';

const LoadingRow = () => {
  return (
    <div className='grid grid-cols-subgrid col-span-9 text-text-secondary border-b border-other-tonalStroke'>
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

export const Positions = () => {
  return (
    <div className='pt-4 px-4 pb-0 overflow-hidden'>
      <div className='relative grid grid-cols-[repeat(9,1fr)] min-w-full h-auto overflow-auto'>
        <div className='grid grid-cols-subgrid sticky top-0 z-10 col-span-9 text-text-secondary border-b border-other-tonalStroke bg-app-main'>
          <HeaderCell>Time</HeaderCell>
          <HeaderCell>Side</HeaderCell>
          <HeaderCell>Trade Amount</HeaderCell>
          <HeaderCell>Effective Price</HeaderCell>
          <HeaderCell>Fee Tier</HeaderCell>
          <HeaderCell>Current Value</HeaderCell>
          <HeaderCell>Status</HeaderCell>
          <HeaderCell>Position ID</HeaderCell>
          <HeaderCell>Actions</HeaderCell>
        </div>

        {new Array(15).fill(0).map((_, i) => (
          <LoadingRow key={i} />
        ))}
      </div>
    </div>
  );
};
