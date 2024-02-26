import { CheckIcon } from '@radix-ui/react-icons';
import { Progress } from '../progress';
import { cn } from '../../../lib/utils';
import { LineWave } from 'react-loader-spinner';
import { useEffect, useState } from 'react';
import { SyncingStateProps } from './syncing-state';
import { motion } from 'framer-motion';

export const FullySyncedState = (props: SyncingStateProps) => {
  return props.size === 'condensed' ? (
    <CondensedFullySyncedState {...props} />
  ) : (
    <LargeFullySyncedState {...props} />
  );
};

const LargeFullySyncedState = ({ latestKnownBlockHeight, fullSyncHeight }: SyncingStateProps) => {
  const showLoader = useNewBlockDelay(fullSyncHeight);

  return (
    <motion.div
      className='flex w-full flex-col gap-1'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } }}
    >
      <div className='flex items-center justify-center'>
        <div className='flex items-center'>
          <p className='font-headline text-xl font-semibold text-teal'>Blocks synced</p>
          <CheckIcon className='size-6 text-teal' />
        </div>
      </div>
      <Progress status='done' value={(fullSyncHeight / latestKnownBlockHeight) * 100} />
      <div className='-ml-3 flex justify-center'>
        <div className='relative'>
          <LineWave
            visible={true}
            height='50'
            width='50'
            color='var(--teal)'
            wrapperClass={cn(
              'transition-all duration-300 absolute bottom-0 right-6',
              showLoader ? 'opacity-100' : 'opacity-0',
            )}
          />
          <p className='font-mono text-teal'>{fullSyncHeight}</p>
        </div>
      </div>
    </motion.div>
  );
};

const CondensedFullySyncedState = ({
  latestKnownBlockHeight,
  fullSyncHeight,
}: SyncingStateProps) => {
  const showLoader = useNewBlockDelay(fullSyncHeight);

  return (
    <motion.div
      className='flex w-full flex-col'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } }}
    >
      <div className='flex justify-between'>
        <div className='flex gap-2'>
          <div className='flex items-center'>
            <p className='font-headline text-teal'>Blocks synced</p>
            <CheckIcon className='size-6 text-teal' />
          </div>
        </div>
        <div className='relative flex'>
          <LineWave
            visible={true}
            height='50'
            width='50'
            color='var(--teal)'
            wrapperClass={cn(
              'transition-all duration-300 absolute bottom-0 right-6',
              showLoader ? 'opacity-100' : 'opacity-0',
            )}
          />
          <p className='font-mono text-teal'>{fullSyncHeight}</p>
        </div>
      </div>
      <Progress status='done' value={(fullSyncHeight / latestKnownBlockHeight) * 100} />
    </motion.div>
  );
};

// Meant to show item temporarily when a new value shows
const useNewBlockDelay = (value: number, duration = 1000) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => setIsVisible(false), duration);
    return () => clearTimeout(timer);
  }, [value, duration]);

  return isVisible;
};
