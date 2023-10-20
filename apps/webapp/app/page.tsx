'use client';

import { useState } from 'react';
import { Card, FadeTransition, Tabs, TabsContent, TabsList, TabsTrigger } from '@penumbra-zone/ui';
import { EduInfoCard } from '../shared';
import { dashboardTabsHelper } from './dashboard/constants';
import { NftsTable } from './dashboard/nfts-table';
import { DashboardPageTab } from './dashboard/types';
import dynamic from 'next/dynamic';

const AssetsTable = dynamic(() => import('./dashboard/assets-table'), {
  ssr: false,
});

const TransactionTable = dynamic(() => import('./dashboard/transaction-table'), {
  ssr: false,
});

export default function Page() {
  const [tab, setTab] = useState<DashboardPageTab>(DashboardPageTab.ASSETS);

  return (
    <FadeTransition className='flex min-h-[calc(100vh-122px)] flex-col items-stretch justify-start'>
      <div className='relative mx-auto grid max-w-[1276px] grid-cols-3 gap-5'>
        <Card gradient className='col-span-2 row-span-2 flex-1 p-5'>
          <Tabs defaultValue={DashboardPageTab.ASSETS} value={tab}>
            <TabsList className='mx-auto grid w-[372px] grid-cols-3 gap-4'>
              <TabsTrigger
                value={DashboardPageTab.ASSETS}
                onClick={() => setTab(DashboardPageTab.ASSETS)}
              >
                Assets
              </TabsTrigger>
              <TabsTrigger
                value={DashboardPageTab.TRANSACTIONS}
                onClick={() => setTab(DashboardPageTab.TRANSACTIONS)}
              >
                Transactions
              </TabsTrigger>
              <TabsTrigger
                value={DashboardPageTab.NFTS}
                onClick={() => setTab(DashboardPageTab.NFTS)}
              >
                NFTs
              </TabsTrigger>
            </TabsList>
            <TabsContent value={DashboardPageTab.ASSETS} className='mt-10'>
              <AssetsTable />
            </TabsContent>
            <TabsContent value={DashboardPageTab.TRANSACTIONS} className='mt-10'>
              <TransactionTable />
            </TabsContent>
            <TabsContent value={DashboardPageTab.NFTS}>
              <NftsTable />
            </TabsContent>
          </Tabs>
        </Card>
        <EduInfoCard src={dashboardTabsHelper[tab].src} label={dashboardTabsHelper[tab].label} />
      </div>
    </FadeTransition>
  );
}
