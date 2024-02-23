import { motion } from 'framer-motion';
import { CheckIcon } from '@radix-ui/react-icons';
import { Progress } from '../progress';
import { useSyncProgress } from './sync-progress-hook';
import { cn } from '../../../lib/utils';

interface BlockSyncProps {
  lastBlockHeight: number;
  lastBlockSynced: number;
}

export const BlockSyncStatus = ({ lastBlockHeight, lastBlockSynced }: BlockSyncProps) => {
  const { formattedTimeRemaining, confident } = useSyncProgress(lastBlockSynced, lastBlockHeight);

  return (
    <motion.div
      className='flex select-none flex-col items-center gap-1 leading-[30px]'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }}
      exit={{ opacity: 0 }}
    >
      {lastBlockHeight ? (
        // Is syncing ⏳
        lastBlockHeight - lastBlockSynced > 10 ? (
          <>
            <div className='flex gap-2'>
              <p className='font-headline text-xl font-semibold text-sand'>Syncing blocks...</p>
            </div>
            <Progress variant='in-progress' value={(lastBlockSynced / lastBlockHeight) * 100} />
            <p className='font-mono text-sand'>
              {lastBlockSynced}/{lastBlockHeight}
            </p>
            <p
              className={cn(
                '-mt-1 font-mono text-sm text-sand transition-all duration-300',
                confident ? 'opacity-100' : 'opacity-0',
              )}
            >
              {formattedTimeRemaining}
            </p>
          </>
        ) : (
          // Is synced ✅
          <>
            <div className='flex gap-2'>
              <div className='flex items-center'>
                <p className='font-headline text-xl font-semibold text-teal'>Blocks synced</p>
                <CheckIcon className='size-6 text-teal' />
              </div>
            </div>
            <Progress variant='done' value={(lastBlockSynced / lastBlockHeight) * 100} />
            <p className='font-mono text-teal'>
              {lastBlockSynced}/{lastBlockHeight}
            </p>
          </>
        )
      ) : null}
    </motion.div>
  );
};
