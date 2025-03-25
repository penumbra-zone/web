import { Skeleton } from '@/shared/ui/skeleton';

export interface RouteBookLoadingRowProps {
  isSpread: boolean;
}

export const RouteBookLoadingRow = ({ isSpread }: RouteBookLoadingRowProps) =>
  isSpread ? (
    <div className='col-span-4 flex items-center justify-center gap-2 px-3 py-3 text-xs border-b border-b-other-tonalStroke'>
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
  ) : (
    <div className='grid grid-cols-subgrid col-span-4 items-center group relative border-b border-b-other-tonalStroke px-4'>
      <div className='w-[56px] h-[16px]'>
        <Skeleton />
      </div>
      <div className='w-[56px] h-[16px] ml-auto'>
        <Skeleton />
      </div>
      <div className='w-[56px] h-[16px] ml-auto'>
        <Skeleton />
      </div>
      <div className='w-[24px] h-[16px] ml-auto'>
        <Skeleton />
      </div>
    </div>
  );
