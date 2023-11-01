'use client';

import { Card, FadeTransition } from '@penumbra-zone/ui';
import dynamic from 'next/dynamic';
import { EduInfoCard } from '../../shared';
import { sendTabs, sendTabsHelper } from '../../shared/constants/send';
import { Tabs } from '../../shared/tabs';
import { DappPath } from '../header/paths';

const SendForm = dynamic(() => import('./send-form'), {
  ssr: false,
});

export default function Page() {
  return (
    <FadeTransition className='flex min-h-[calc(100vh-122px)] flex-col items-stretch justify-start'>
      <div className='relative mx-auto grid max-w-[1276px] grid-cols-3 gap-5'>
        <div />
        <Card gradient className='row-span-2 flex-1 p-5'>
          <Tabs tabs={sendTabs} activeTab={DappPath.SEND} />
          <SendForm />
        </Card>
        <EduInfoCard
          src={sendTabsHelper.send.src}
          label={sendTabsHelper.send.label}
          content={sendTabsHelper.send.content}
        />
      </div>
    </FadeTransition>
  );
}
