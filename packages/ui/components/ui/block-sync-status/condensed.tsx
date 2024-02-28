import { LineWave } from 'react-loader-spinner';
import { CheckIcon } from '@radix-ui/react-icons';
import { motion } from 'framer-motion';
import { useNewBlockDelay, useSyncProgress } from './hooks';
import { Progress } from '../progress';
import { BlockSyncProps, SyncingStateProps } from './shared';
import { cn } from '../../../lib/utils';

export const CondensedBlockSyncStatus = ({
  latestKnownBlockHeight,
  fullSyncHeight,
  error,
}: Partial<BlockSyncProps>) => {
  if (error) return <BlockSyncErrorState />;
  if (!latestKnownBlockHeight || !fullSyncHeight) return <AwaitingSyncState />;

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

const BlockSyncErrorState = () => {
  return (
    <motion.div
      className='flex flex-col leading-[30px]'
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }}
    >
      <p className='font-headline text-red-900'>Error while retrieving block sync status</p>
      <Progress status='error' value={100} />
    </motion.div>
  );
};

const AwaitingSyncState = () => {
  return (
    <div className='flex select-none flex-col items-center gap-1 leading-[30px]'>
      <div className='flex w-full flex-col'>
        <div className='flex justify-between'>
          <div className='flex gap-2'>
            <p className='font-headline text-stone-500'>Loading sync state...</p>
          </div>
          <div className='relative -mr-6 -mt-4'>
            <LineWave
              visible={true}
              height='50'
              width='50'
              color='#78716c'
              wrapperClass="transition-all duration-300 absolute right-0 bottom-0'"
            />
          </div>
        </div>
        <Progress status='in-progress' background='stone' value={0} />
      </div>
    </div>
  );
};

const SyncingState = ({ fullSyncHeight, latestKnownBlockHeight }: SyncingStateProps) => {
  const { formattedTimeRemaining, confident } = useSyncProgress(
    fullSyncHeight,
    latestKnownBlockHeight,
  );

  return (
    <motion.div
      className='flex w-full flex-col'
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }}
    >
      <div className='flex justify-between text-sand'>
        <div className='flex gap-2'>
          <p className='font-headline'>Syncing blocks...</p>
        </div>
        <div className='flex items-center gap-2'>
          <p
            className={cn(
              'font-mono transition-all duration-300',
              confident ? 'opacity-100' : 'opacity-0',
            )}
          >
            {formattedTimeRemaining} ::
          </p>
          <p className='font-mono'>
            {fullSyncHeight}/{latestKnownBlockHeight}
          </p>
        </div>
      </div>
      <Progress
        status='in-progress'
        value={(fullSyncHeight / latestKnownBlockHeight) * 100}
        background='stone'
      />
    </motion.div>
  );
};

const FullySyncedState = ({ latestKnownBlockHeight, fullSyncHeight }: SyncingStateProps) => {
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
              'transition-all duration-300 absolute bottom-0 right-3',
              showLoader ? 'opacity-100' : 'opacity-0',
            )}
          />
          <p className='font-mono text-teal'>{fullSyncHeight}</p>
        </div>
      </div>
      <div className='relative'>
        <div className='absolute left-1 top-0 z-20 -mt-2.5 font-mono text-[10px] text-teal-900'>
          Blocks synced
        </div>
        <div className='absolute right-1 top-0 z-20 -mt-2.5 font-mono text-[10px] text-teal-900'>
          {fullSyncHeight}
        </div>
        <Progress status='done' value={(fullSyncHeight / latestKnownBlockHeight) * 100} />
      </div>
    </motion.div>
  );
};
