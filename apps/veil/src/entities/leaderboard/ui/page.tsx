'use server';

import { useState } from 'react';
import { LeaderboardTable } from './table';
import { PenumbraWaves } from '@/pages/explore/ui/waves';
import { useRouter } from 'next/router';

export const LeaderboardPage = () => {
  const startBlock = 697684;
  const endBlock = 2697684;

  return (
    <section className='flex flex-col gap-6 p-4 max-w-[1062px] mx-auto'>
      <PenumbraWaves />
      <LeaderboardTable startBlock={startBlock} endBlock={endBlock} />
    </section>
  );
};
