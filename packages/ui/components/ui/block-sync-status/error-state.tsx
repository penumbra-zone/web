import { Progress } from '../progress';
import { motion } from 'framer-motion';

export const BlockSyncErrorState = () => {
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
