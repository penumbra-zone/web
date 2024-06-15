import { CheckIcon } from '@radix-ui/react-icons';
import { BigNumber } from 'bignumber.js';
import { motion } from 'framer-motion';
import { LineWave } from 'react-loader-spinner';
import { cn } from '../../../lib/utils';
import { Progress } from '../progress';
import { useNewBlockDelay, useSyncProgress } from './hooks';

export const CondensedBlockSyncStatus = ({
  latestKnownBlockHeight,
  fullSyncHeight,
  error,
}: {
  latestKnownBlockHeight?: bigint;
  fullSyncHeight?: bigint;
  error?: unknown;
}) => {
  if (error) return <BlockSyncErrorState error={error} />;
  if (!latestKnownBlockHeight || !fullSyncHeight)
    return <AwaitingSyncState genesisSyncing={!fullSyncHeight} />;

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
      <Progress status='error' value={100} shape='squared' />
      <div className='absolute flex w-full justify-between px-2'>
        <div className='mt-[-5.5px] font-mono text-[10px] text-red-300'>
          Block sync error: {String(error)}
        </div>
      </div>
    </motion.div>
  );
};

const AwaitingSyncState = ({ genesisSyncing }: { genesisSyncing: boolean }) => {
  return (
    <div className='flex select-none flex-col'>
      <Progress status='in-progress' background='stone' shape='squared' value={0} />
      <div className='absolute flex w-full justify-between px-2'>
        <div className='mt-[-5.5px] font-mono text-[10px] text-stone-400'>
          {genesisSyncing ? 'Genesis state syncing...' : 'Loading sync state...'}
        </div>
        <LineWave
          visible={true}
          height='20'
          width='20'
          color='#a8a29e'
          wrapperClass='mt-[-7.5px]'
        />
      </div>
    </div>
  );
};

const SyncingState = ({
  fullSyncHeight: fullSyncHeightBigInt,
  latestKnownBlockHeight: latestKnownBlockHeightBigInt,
}: {
  latestKnownBlockHeight: bigint;
  fullSyncHeight: bigint;
}) => {
  const { formattedTimeRemaining, confident } = useSyncProgress(
    fullSyncHeightBigInt,
    latestKnownBlockHeightBigInt,
  );

  const fullSyncHeight = BigNumber(String(fullSyncHeightBigInt));
  const latestKnownBlockHeight = BigNumber(String(latestKnownBlockHeightBigInt));

  return (
    <motion.div
      className='flex w-full flex-col'
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }}
    >
      <Progress
        status='in-progress'
        value={fullSyncHeight.dividedBy(latestKnownBlockHeight).multipliedBy(100).toNumber()}
        background='stone'
        shape='squared'
      />
      <div className='absolute flex w-full justify-between px-2 font-mono text-[10px] text-[#4a4127] mix-blend-plus-lighter'>
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
            {String(fullSyncHeight)} / {String(latestKnownBlockHeight)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const FullySyncedState = ({
  latestKnownBlockHeight: latestKnownBlockHeightBigInt,
  fullSyncHeight: fullSyncHeightBigInt,
}: {
  latestKnownBlockHeight: bigint;
  fullSyncHeight: bigint;
}) => {
  const showLoader = useNewBlockDelay(fullSyncHeightBigInt);
  const fullSyncHeight = BigNumber(String(fullSyncHeightBigInt));
  const latestKnownBlockHeight = BigNumber(String(latestKnownBlockHeightBigInt));

  return (
    <motion.div
      className='relative flex w-full flex-col'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } }}
    >
      <Progress
        status='done'
        value={fullSyncHeight.dividedBy(latestKnownBlockHeight).multipliedBy(100).toNumber()}
        shape='squared'
      />
      <div className='absolute flex w-full justify-between px-2'>
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
            Block {String(fullSyncHeight)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
