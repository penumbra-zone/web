import { Card, FadeTransition } from '@penumbra-zone/ui';
import React from 'react';
import { EduInfoCard } from '../../shared';
import dynamic from 'next/dynamic';
import { EduPanel } from '../../shared/edu-panels/content';

const HashParser = dynamic(() => import('./hash-parser'), {
  ssr: false,
});

export default function Page() {
  return (
    <FadeTransition className='flex min-h-[calc(100vh-122px)] flex-col items-stretch justify-start'>
      <div className='relative mx-auto grid max-w-[1276px] grid-cols-3 gap-5'>
        <Card gradient className='col-span-2 row-span-2 flex-1 md:p-4 xl:p-5'>
          <HashParser />
        </Card>
        <EduInfoCard
          src='/incognito.svg'
          label='Shielded Transactions'
          content={EduPanel.SHIELDED_TRANSACTION}
        />
      </div>
    </FadeTransition>
  );
}
