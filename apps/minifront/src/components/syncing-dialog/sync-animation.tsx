import { cn } from '@penumbra-zone/ui-deprecated/lib/utils';
import illustration from './illustration.svg?url';
import { useMemo } from 'react';
import { Code, ConnectError } from '@connectrpc/connect';

/**
 * @todo Use Penumbra UI values for rounding, etc. once its Tailwind config is
 * ready.
 */
export const SyncAnimation = ({ error, running }: { error?: Error; running?: boolean }) => {
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
    <div className={cn('absolute', 'left-0 top-0', 'size-full', '-z-10', 'overflow-hidden')}>
      <div className={cn('pt-8 px-4', '[mask-image:linear-gradient(black,transparent_65%)]')}>
        <img
          src={illustration}
          alt='A loading illustration'
          className={cn(
            'w-full',
            mode === 'starting' && [
              'animate-[spin_60s_infinite]',
              '[animation-timing-function:steps(48,jump-start)]',
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
              'blur-[1px]',
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
  );
};
