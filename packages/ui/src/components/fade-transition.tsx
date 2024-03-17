'use client';

import { motion } from 'framer-motion';
import React from 'react';
import { cn } from '../util';

const FadeTransition = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      className={cn('flex min-h-screen w-[100%] flex-col items-center justify-center', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } }}
      exit={{ opacity: 0 }}
    >
      <div className='flex flex-col'>{children}</div>
    </motion.div>
  );
};

FadeTransition.displayName = 'FadeTransition';

export { FadeTransition };
