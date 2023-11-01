'use client';

import { Card, FadeTransition } from '@penumbra-zone/ui';
import dynamic from 'next/dynamic';
import { Tabs } from '../../shared/tabs';
import { dashboardTabs, dashboardTabsHelper } from '../../shared/constants/dashboard';
import { DappPath } from '../header/paths';
import { EduInfoCard } from '../../shared';

const TransactionsTable = dynamic(() => import('./transaction-table'), {
  ssr: false,
});

export default function Page() {
  return (
    <FadeTransition className='flex min-h-[calc(100vh-122px)] flex-col items-stretch justify-start'>
      <div className='relative mx-auto grid max-w-[1276px] grid-cols-3 gap-5 px-5'>
        <Card gradient className='col-span-2 row-span-2 flex-1 p-5'>
          <Tabs
            tabs={dashboardTabs}
            activeTab={DappPath.TRANSACTIONS}
            className='mx-auto w-[372px]'
          />
          <TransactionsTable />
        </Card>
        <EduInfoCard
          src={dashboardTabsHelper.transactions.src}
          label={dashboardTabsHelper.transactions.label}
          content={dashboardTabsHelper.transactions.content}
        />
      </div>
    </FadeTransition>
  );
}
