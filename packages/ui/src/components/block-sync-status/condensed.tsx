import { LineWave } from 'react-loader-spinner';
import { CheckIcon } from '@radix-ui/react-icons';
import { motion } from 'framer-motion';
import { useNewBlockDelay, useSyncProgress } from './hooks';
import { Progress } from '../progress';
import { BlockSyncProps, SyncingStateProps } from './shared';
import { cn } from '../../utils';

export const CondensedBlockSyncStatus = ({
  latestKnownBlockHeight,
  fullSyncHeight,
  error,
}: Partial<BlockSyncProps>) => {
  if (error) return <BlockSyncErrorState error={error} />;
  if (!latestKnownBlockHeight || !fullSyncHeight) return <AwaitingSyncState />;

  const isSyncing = latestKnownBlockHeight - fullSyncHeight > 10;

  return (
    <div className='flex w-full select-none flex-col items-center'>
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
      className='flex w-full select-none flex-col'
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }}
    >
      <div className='absolute z-20 flex w-full justify-between px-2'>
        <div className='mt-[-5.5px] font-mono text-[10px] text-red-300'>
          Block sync error: {String(error)}
        </div>
      </div>
      <Progress status='error' value={100} shape='squared' />
    </motion.div>
  );
};

const AwaitingSyncState = () => {
  return (
    <div className='flex select-none flex-col'>
      <div className='absolute z-20 flex w-full justify-between px-2'>
        <div className='mt-[-5.5px] font-mono text-[10px] text-stone-400'>
          <div>Loading sync state...</div>
        </div>
        <LineWave
          visible={true}
          height='20'
          width='20'
          color='#a8a29e'
          wrapperClass='mt-[-7.5px]'
        />
      </div>
      <Progress status='in-progress' background='stone' shape='squared' value={0} />
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
      <div className='absolute z-20 flex w-full justify-between px-2 font-mono text-[10px] text-[#4a4127] mix-blend-plus-lighter'>
        <div className='mt-[-5.5px]'>Syncing blocks...</div>
        <div className='mt-[-5.5px] flex gap-2'>
          <span
            className={cn(
              'font-mono transition-all duration-300',
              confident ? 'opacity-100' : 'opacity-0',
            )}
          >
            {formattedTimeRemaining}
          </span>
          <span className={confident ? 'opacity-100' : 'opacity-0'}>::</span>
          <span className='font-mono'>
            {fullSyncHeight} / {latestKnownBlockHeight}
          </span>
        </div>
      </div>
      <Progress
        status='in-progress'
        value={(fullSyncHeight / latestKnownBlockHeight) * 100}
        background='stone'
        shape='squared'
      />
    </motion.div>
  );
};

const FullySyncedState = ({ latestKnownBlockHeight, fullSyncHeight }: SyncingStateProps) => {
  const showLoader = useNewBlockDelay(fullSyncHeight);

  return (
    <motion.div
      className='relative flex w-full flex-col'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } }}
    >
      <div className='absolute z-20 flex w-full justify-between px-2'>
        <div className='mt-[-5.5px] font-mono text-[10px] text-teal-900'>
          <div className='flex items-center'>
            <p>Blocks synced</p>
            <CheckIcon className='size-3 text-teal-900' />
          </div>
        </div>
        <div className='flex'>
          <LineWave
            visible={true}
            height='20'
            width='20'
            color='#134e4a'
            wrapperClass={cn(
              'transition-all duration-300 mt-[-7px] mr-[-7px]',
              showLoader ? 'opacity-100' : 'opacity-0',
            )}
          />
          <div className='mt-[-5.5px] font-mono text-[10px] text-teal-900'>
            Block {fullSyncHeight}
          </div>
        </div>
      </div>
      <Progress
        status='done'
        value={(fullSyncHeight / latestKnownBlockHeight) * 100}
        shape='squared'
      />
    </motion.div>
  );
};
