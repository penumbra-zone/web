'use client';

import { Card, FadeTransition } from '@penumbra-zone/ui';
import dynamic from 'next/dynamic';
import { Tabs } from '../../shared/tabs';
import { dashboardTabs, dashboardTabsHelper } from '../../shared/constants/dashboard';
import { DappPath } from '../header/paths';
import { EduInfoCard } from '../../shared';

const AssetsTable = dynamic(() => import('./assets-table'), {
  ssr: false,
});

export default function Page() {
  return (
    <FadeTransition className='flex min-h-[calc(100vh-122px)] flex-col items-stretch justify-start'>
      <div className='relative mx-auto grid max-w-[1276px] grid-cols-3 gap-5 px-5'>
        <Card gradient className='col-span-2 row-span-2 flex-1 p-5'>
          <Tabs tabs={dashboardTabs} activeTab={DappPath.ASSETS} className='w-[372px] mx-auto' />
          <AssetsTable />
        </Card>
        <EduInfoCard
          src={dashboardTabsHelper.assets.src}
          label={dashboardTabsHelper.assets.label}
          content={dashboardTabsHelper.assets.content}
        />
      </div>
    </FadeTransition>
  );
}
