import { Progress } from '@penumbra-zone/ui';
import { motion } from 'framer-motion';
import { CheckIcon } from '@radix-ui/react-icons';
import { useSyncProgress } from '../../../hooks/last-block-synced';

export const BlockSync = () => {
  const { lastBlockHeight, lastBlockSynced } = useSyncProgress();

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
          </>
        ) : (
          // Is synced ✅
          <>
            <div className='flex gap-2'>
              <div className='flex items-center'>
                <p className='font-headline text-xl font-semibold text-teal'>Blocks synced</p>
                <CheckIcon className='h-6 w-6 text-teal' />
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
