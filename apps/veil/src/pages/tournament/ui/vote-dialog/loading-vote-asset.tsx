import { Skeleton } from '@penumbra-zone/ui/Skeleton';

export const LoadingVoteAsset = () => {
  return (
    <div className='flex h-14 w-full gap-3 p-3'>
      <div className='size-8'>
        <Skeleton circular />
      </div>
      <div className='flex grow flex-col gap-1'>
        <div className='flex justify-between py-1'>
          <div className='h-4 w-10'>
            <Skeleton />
          </div>
          <div className='h-4 w-10'>
            <Skeleton />
          </div>
        </div>
        <div className='h-1 w-full overflow-hidden rounded-xs'>
          <Skeleton />
        </div>
      </div>
    </div>
  );
};
