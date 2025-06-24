import { Skeleton } from '@/shared/ui/skeleton';

export interface RouteBookLoadingRowProps {
  isSpread: boolean;
}

export const RouteBookLoadingRow = ({ isSpread }: RouteBookLoadingRowProps) =>
  isSpread ? (
    <div className='col-span-4 flex items-center justify-center gap-2 border-b border-b-other-tonal-stroke px-3 py-3 text-xs'>
      <div className='h-[16px] w-[78px]'>
        <Skeleton />
      </div>
      <div className='h-[16px] w-[54px]'>
        <Skeleton />
      </div>
      <div className='h-[16px] w-[69px]'>
        <Skeleton />
      </div>
      <div className='h-[16px] w-[39px]'>
        <Skeleton />
      </div>
    </div>
  ) : (
    <div className='group relative col-span-4 grid grid-cols-subgrid items-center border-b border-b-other-tonal-stroke px-4'>
      <div className='h-[16px] w-[56px]'>
        <Skeleton />
      </div>
      <div className='ml-auto h-[16px] w-[56px]'>
        <Skeleton />
      </div>
      <div className='ml-auto h-[16px] w-[56px]'>
        <Skeleton />
      </div>
      <div className='ml-auto h-[16px] w-[24px]'>
        <Skeleton />
      </div>
    </div>
  );
