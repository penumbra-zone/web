'use client';

import { Card, FadeTransition } from '@penumbra-zone/ui';
import { EduInfoCard } from '../../shared';
import { Tabs } from '../../shared/tabs';
import { DappPath } from '../header/paths';
import { sendTabs, sendTabsHelper } from '../../shared/constants/send';
import { ReceiveForm } from './receive-form';

export default function Page() {
  return (
    <FadeTransition className='flex min-h-[calc(100vh-122px)] flex-col items-stretch justify-start'>
      <div className='relative mx-auto grid max-w-[1276px] grid-cols-3 gap-5'>
        <div />
        <Card gradient className='row-span-2 flex-1 p-5'>
          <Tabs tabs={sendTabs} activeTab={DappPath.RECEIVE} />
          <ReceiveForm />
        </Card>
        <EduInfoCard
          src={sendTabsHelper.receive.src}
          label={sendTabsHelper.receive.label}
          content={sendTabsHelper.receive.content}
        />
      </div>
    </FadeTransition>
  );
}
