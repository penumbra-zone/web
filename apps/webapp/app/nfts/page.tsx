'use client';

import { Card, FadeTransition } from '@penumbra-zone/ui';
import { Tabs } from '../../shared/tabs';
import { DappPath } from '../header/paths';
import { EduInfoCard } from '../../shared';
import { NftsTable } from './nfts-table';
import { dashboardTabs, dashboardTabsHelper } from '../../shared/constants/dashboard';

export default function Page() {
  return (
    <FadeTransition className='flex min-h-[calc(100vh-122px)] flex-col items-stretch justify-start'>
      <div className='relative mx-auto grid max-w-[1276px] grid-cols-3 gap-5 px-5'>
        <Card gradient className='col-span-2 row-span-2 flex-1 p-5'>
          <Tabs tabs={dashboardTabs} activeTab={DappPath.NFTS} className='mx-auto w-[372px]' />
          <NftsTable />
        </Card>
        <EduInfoCard
          src={dashboardTabsHelper.nfts.src}
          label={dashboardTabsHelper.nfts.label}
          content={dashboardTabsHelper.nfts.content}
        />
      </div>
    </FadeTransition>
  );
}
