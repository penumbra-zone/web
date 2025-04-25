import { Skeleton } from '@penumbra-zone/ui/Skeleton';

export const LoadingVoteAsset = () => {
  return (
    <div className='w-full h-14 flex gap-3 p-3'>
      <div className='size-8'>
        <Skeleton circular />
      </div>
      <div className='grow flex flex-col gap-1'>
        <div className='flex justify-between py-1'>
          <div className='h-4 w-10'>
            <Skeleton />
          </div>
          <div className='h-4 w-10'>
            <Skeleton />
          </div>
        </div>
        <div className='w-full h-1 rounded-xs overflow-hidden'>
          <Skeleton />
        </div>
      </div>
    </div>
  );
};
