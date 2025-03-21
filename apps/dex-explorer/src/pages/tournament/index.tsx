'use client';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { LandingCard } from './ui/landing-card';

export const TournamentPage = observer(() => {
  return (
    <div className='sm:container mx-auto py-8 flex flex-col gap-4'>
      <LandingCard />
    </div>
  );
});
