'use client';

import { useState } from 'react';
import { PenumbraWaves } from '@/pages/explore/ui/waves';
import { MyRewards } from './my-rewards';
import { LandingCard } from './landing-card';
import { DelegatorLeaderboard } from './delegator-leaderboard';
import { PreviousEpochs } from './previous-epochs';
import { SocialCardDialog } from './social-card-dialog';

export const TournamentPage = () => {
  const [isSocialCardDialogOpen, setIsSocialCardDialogOpen] = useState(false);

  return (
    <section className='flex flex-col gap-6 p-4 max-w-[1168px] mx-auto'>
      <button onClick={() => setIsSocialCardDialogOpen(true)}>Open Social Card Dialog</button>
      <PenumbraWaves />
      <LandingCard />
      <MyRewards />

      <DelegatorLeaderboard />
      <PreviousEpochs />
      <SocialCardDialog
        isOpen={isSocialCardDialogOpen}
        onClose={() => setIsSocialCardDialogOpen(false)}
      />
    </section>
  );
};
