import { Skeleton } from '@/shared/ui/skeleton';

export const LoadingAsset = () => {
  return (
    <div className='flex h-16 w-full items-center justify-between gap-2 rounded-sm bg-other-tonal-fill5 p-3'>
      <div className='size-8 overflow-hidden rounded-full'>
        <Skeleton />
      </div>
      <div className='flex grow flex-col'>
        <div className='h-6 min-h-6 w-10 py-1'>
          <Skeleton />
        </div>
        <div className='h-4 min-h-4 w-24'>
          <Skeleton />
        </div>
      </div>
      <div className='h-4 min-h-4 w-20'>
        <Skeleton />
      </div>
    </div>
  );
};
