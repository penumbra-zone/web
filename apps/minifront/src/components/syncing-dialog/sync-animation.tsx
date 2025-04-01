import { cn } from '@penumbra-zone/ui-deprecated/lib/utils';
import illustration from './illustration.svg?url';
import { useMemo } from 'react';
import { Code, ConnectError } from '@connectrpc/connect';

/**
 * @todo Use Penumbra UI values for rounding, etc. once its Tailwind config is
 * ready.
 */
export const SyncAnimation = ({ error, running }: { error?: unknown; running?: boolean }) => {
  const mode = useMemo(() => {
    if (error instanceof ConnectError && error.code === Code.Unavailable) {
      return 'stopped';
    } else if (error) {
      return 'retrying';
    } else if (!running) {
      return 'starting';
    } else {
      return 'streaming';
    }
  }, [error, running]);

  return (
    <div className='flex flex-col gap-8 rounded-sm bg-black'>
      <div className='relative h-0 overflow-hidden pb-[33%]'>
        <div className='absolute left-1/2 top-0 w-full -translate-x-1/2 overflow-hidden'>
          <img
            src={illustration}
            alt='A loading illustration'
            className={cn(
              'w-full',
              mode === 'starting' && [
                'animate-[spin_60s_infinite]',
                '[animation-timing-function:steps(48,jump-start)]',
                'blur-[1px]',
              ],
              mode === 'streaming' && [
                'animate-[spin_5s_infinite]',
                '[animation-timing-function:steps(48)]',
                'brightness-100',
              ],
              mode === 'retrying' && [
                '[animation-composition:accumulate]',
                'animate-[spin_60s_infinite,spin_60s_infinite_reverse]',
                '[animation-timing-function:steps(96),ease-in-out]',
                'grayscale',
              ],
              mode === 'stopped' && [
                '[animation-composition:accumulate]',
                'animate-[spin_5s_infinite_alternate,spin_7s_infinite_alternate,spin_120s_infinite_reverse]',
                '[animation-timing-function:steps(3),steps(5),ease-in-out]',
                'opacity-50',
                'blur-[2px]',
                'sepia',
              ],
            )}
          />
        </div>
      </div>
    </div>
  );
};
