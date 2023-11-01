'use client';

import { Card, FadeTransition } from '@penumbra-zone/ui';
import { EduInfoCard } from '../../shared';
import { Tabs } from '../../shared/tabs';
import { DappPath } from '../header/paths';
import { sendTabs, sendTabsHelper } from '../../shared/constants/send';
import dynamic from 'next/dynamic';

const IbcForm = dynamic(() => import('./ibc-form'), {
  ssr: false,
});

export default function Page() {
  return (
    <FadeTransition className='flex min-h-[calc(100vh-122px)] flex-col items-stretch justify-start'>
      <div className='relative mx-auto grid max-w-[1276px] grid-cols-3 gap-5'>
        <div />
        <Card gradient className='row-span-2 flex-1 p-5'>
          <Tabs tabs={sendTabs} activeTab={DappPath.IBC} />
          <IbcForm />
        </Card>
        <EduInfoCard
          src={sendTabsHelper.ibc.src}
          label={sendTabsHelper.ibc.label}
          content={sendTabsHelper.ibc.content}
        />
      </div>
    </FadeTransition>
  );
}
