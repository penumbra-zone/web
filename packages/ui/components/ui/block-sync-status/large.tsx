import { LineWave } from 'react-loader-spinner';
import { CheckIcon } from '@radix-ui/react-icons';
import { motion } from 'framer-motion';
import { useNewBlockDelay, useSyncProgress } from './hooks';
import { Progress } from '../progress';
import { BlockSyncProps, SyncingStateProps } from './shared';
import { cn } from '../../../lib/utils';

export const LargeBlockSyncStatus = ({
  latestKnownBlockHeight,
  fullSyncHeight,
  error,
}: BlockSyncProps) => {
  if (error) return <BlockSyncErrorState error={error} />;
  if (!latestKnownBlockHeight || !fullSyncHeight) {
    return <AwaitingState genesisSyncing={!fullSyncHeight} />;
  }

  const isSyncing = latestKnownBlockHeight - fullSyncHeight > 10;

  return (
    <div className='flex w-full select-none flex-col items-center leading-[30px]'>
      {isSyncing ? (
        <SyncingState
          latestKnownBlockHeight={latestKnownBlockHeight}
          fullSyncHeight={fullSyncHeight}
        />
      ) : (
        <FullySyncedState
          latestKnownBlockHeight={latestKnownBlockHeight}
          fullSyncHeight={fullSyncHeight}
        />
      )}
    </div>
  );
};

const BlockSyncErrorState = ({ error }: { error: unknown }) => {
  return (
    <motion.div
      className='flex w-full select-none flex-col items-center leading-[30px]'
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }}
    >
      <p className='font-headline text-red-900'>Block sync error</p>
      <Progress status='error' value={100} />
      <p className='font-mono text-red-900'>{String(error)}</p>
    </motion.div>
  );
};

// Not having a fullSyncHeight indicates we are doing a fresh sync.
// The genesis block is particularly large, so we have special text to indicate that.
const AwaitingState = ({ genesisSyncing }: { genesisSyncing: boolean }) => {
  return (
    <motion.div
      className='flex w-full flex-col gap-1'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3, ease: 'easeOut', delay: 0.75 } }}
    >
      <div className='flex items-center justify-center'>
        <div className='flex items-center'>
          <p className='font-headline text-xl font-semibold text-stone-500'>
            {genesisSyncing ? 'Genesis block syncing...' : 'Loading sync state...'}
          </p>
        </div>
      </div>
      <Progress status='loading' value={100} />
      <div className='-ml-3 flex justify-center'>
        <div className='relative'>
          <LineWave
            visible={true}
            height='50'
            width='50'
            color='#71717a'
            wrapperClass='transition-all duration-300 -mt-5 -mr-5 text-stone-500'
          />
        </div>
      </div>
    </motion.div>
  );
};

const SyncingState = ({ fullSyncHeight, latestKnownBlockHeight }: SyncingStateProps) => {
  const { formattedTimeRemaining, confident } = useSyncProgress(
    fullSyncHeight,
    latestKnownBlockHeight,
  );

  return (
    <motion.div
      className='flex w-full flex-col items-center gap-1'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } }}
    >
      <p className='font-headline text-xl font-semibold text-sand'>Syncing blocks...</p>
      <Progress
        status='in-progress'
        value={(fullSyncHeight / latestKnownBlockHeight) * 100}
        background='black'
      />
      <p className='font-mono text-sand'>
        {fullSyncHeight}/{latestKnownBlockHeight}
      </p>
      <p
        className={cn(
          '-mt-1 font-mono text-sm text-sand transition-all duration-300',
          confident ? 'opacity-100' : 'opacity-0',
        )}
      >
        {formattedTimeRemaining}
      </p>
    </motion.div>
  );
};

const FullySyncedState = ({ latestKnownBlockHeight, fullSyncHeight }: SyncingStateProps) => {
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
              'transition-all duration-300 absolute bottom-0 -left-7',
              showLoader ? 'opacity-100' : 'opacity-0',
            )}
          />
          <p className='font-mono text-teal'>{fullSyncHeight}</p>
        </div>
      </div>
    </motion.div>
  );
};
