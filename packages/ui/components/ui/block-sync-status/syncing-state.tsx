import { useSyncProgress } from './sync-progress-hook';
import { Progress } from '../progress';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';

export interface SyncingStateProps {
  latestKnownBlockHeight: number;
  fullSyncHeight: number;
  background?: 'black' | 'stone';
  size?: 'large' | 'condensed';
}

export const SyncingState = (props: SyncingStateProps) => {
  return props.size === 'condensed' ? (
    <CondensedSyncingState {...props} />
  ) : (
    <LargeSyncingState {...props} />
  );
};

const LargeSyncingState = ({
  fullSyncHeight,
  latestKnownBlockHeight,
  background,
}: SyncingStateProps) => {
  const { formattedTimeRemaining, confident } = useSyncProgress(
    fullSyncHeight,
    latestKnownBlockHeight,
  );

  return (
    <motion.div
      className='flex w-full flex-col items-center gap-1'
      initial={{ opacity: 1 }}
      animate={{ opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } }}
    >
      <p className='font-headline text-xl font-semibold text-sand'>Syncing blocks...</p>
      <Progress
        status='in-progress'
        value={(fullSyncHeight / latestKnownBlockHeight) * 100}
        background={background}
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

const CondensedSyncingState = ({
  fullSyncHeight,
  latestKnownBlockHeight,
  background,
}: SyncingStateProps) => {
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
        background={background}
      />
    </motion.div>
  );
};
