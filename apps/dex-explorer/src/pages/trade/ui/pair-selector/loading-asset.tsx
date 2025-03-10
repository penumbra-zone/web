import { Skeleton } from '@/shared/ui/skeleton';

export const LoadingAsset = () => {
  return (
    <div className='flex gap-2 justify-between items-center w-full h-16 p-3 bg-other-tonalFill5 rounded-sm'>
      <div className='size-8 rounded-full overflow-hidden'>
        <Skeleton />
      </div>
      <div className='grow flex flex-col'>
        <div className='w-10 h-6 min-h-6 py-1'>
          <Skeleton />
        </div>
        <div className='w-24 h-4 min-h-4'>
          <Skeleton />
        </div>
      </div>
      <div className='w-20 h-4 min-h-4'>
        <Skeleton />
      </div>
    </div>
  );
};
