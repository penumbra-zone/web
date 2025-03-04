import { cn } from '@penumbra-zone/ui-deprecated/lib/utils';
import illustration from './illustration.svg?url';

/**
 * @todo Use Penumbra UI values for rounding, etc. once its Tailwind config is
 * ready.
 */
export const SyncAnimation = ({ pause }: { pause: boolean }) => (
  <div className='flex flex-col gap-8 rounded-sm bg-black'>
    <div className='relative h-0 overflow-hidden pb-[33%]'>
      <div className='absolute left-1/2 top-0 w-full -translate-x-1/2 overflow-hidden'>
        <img
          src={illustration}
          alt='A loading illustration'
          className={cn('w-full', '[animation-duration:5s]', !pause && 'animate-spin')}
        />
      </div>
    </div>
  </div>
);
