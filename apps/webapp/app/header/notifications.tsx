import { ArrowTopRightIcon } from '@radix-ui/react-icons';
import { Popover, PopoverContent, PopoverTrigger, Progress } from 'ui';
import { cn } from 'ui/lib/utils';
import { ResponsiveImage } from '../../shared';

const txs = [
  {
    type: 'Send',
    amount: 120,
    asset: 'penumbra',
    status: 'pending',
    date: new Date(),
  },
  {
    type: 'Send',
    amount: 120,
    asset: 'penumbra',
    status: 'confirmed',
    date: new Date(),
  },
  {
    type: 'Send',
    amount: 120,
    asset: 'penumbra',
    status: 'failed',
    date: new Date(),
  },
  {
    type: 'Send',
    amount: 120,
    asset: 'penumbra',
    status: 'failed',
    date: new Date(),
  },
];

export const Notifications = () => {
  return (
    <Popover>
      <PopoverTrigger className='relative'>
        <div className='absolute right-[2px] top-[5px] h-[10px] w-[10px] rounded-full bg-sand z-10'></div>
        <ResponsiveImage src='/bell.svg' alt='Bell' className='h-[30px] w-[30px]' />
      </PopoverTrigger>
      <PopoverContent className='relative flex w-[400px] flex-col gap-10 bg-charcoal-secondary px-[30px] pb-[46px] pt-5'>
        <div className='relative z-10 flex flex-col gap-2'>
          <div className='flex items-center justify-between text-base text-sand'>
            <div className='flex items-center gap-2'>
              <ResponsiveImage src='/sync.svg' alt='Syncing blocks...' className='h-6 w-6' />
              <p className='font-headline font-semibold'>Syncing blocks...</p>
            </div>
            <p className='font-bold'>10982/121312</p>
          </div>
          <Progress value={73} />
        </div>
        <div className='relative z-10 flex flex-col gap-4'>
          <p className='font-headline text-lg font-semibold leading-6 text-muted'>Transactions</p>
          <div className='flex max-h-[240px] flex-col gap-4 overflow-auto'>
            {txs.map((i, index) => (
              <div key={index} className='flex items-center justify-between'>
                <div className='flex gap-2 font-bold'>
                  <ArrowTopRightIcon className='h-5 w-5' />
                  <div className='flex flex-col items-start'>
                    <p>{`${i.type} ${i.amount} ${i.asset}`}</p>
                    <p className='text-xs leading-[18px]'>Aug.31st 12:32pm</p>
                  </div>
                </div>
                <p
                  className={cn(
                    'font-bold capitalize',
                    i.status === 'failed' && 'text-red',
                    i.status === 'confirmed' && 'text-green',
                  )}
                >
                  {i.status}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className='absolute inset-0 z-0 bg-card-radial opacity-20' />
      </PopoverContent>
    </Popover>
  );
};
