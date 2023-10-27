'use client';

import { useState } from 'react';
import { Card, FadeTransition, Tabs, TabsContent, TabsList, TabsTrigger } from '@penumbra-zone/ui';
import { EduInfoCard } from '../shared';
import { dashboardTabsHelper } from './dashboard/constants';
import { DashboardPageTab } from './dashboard/types';
import dynamic from 'next/dynamic';
import { useStore } from '../state';
import { accountSelector } from '../state/account';

const AssetsTable = dynamic(() => import('./dashboard/assets-table'), {
  ssr: false,
});

const TransactionTable = dynamic(() => import('./dashboard/transaction-table'), {
  ssr: false,
});

const NotConnected = dynamic(() => import('./dashboard/not-connected'), {
  ssr: false,
});

export default function Page() {
  const [tab, setTab] = useState<DashboardPageTab>(DashboardPageTab.ASSETS);
  const { isConnected } = useStore(accountSelector);

  return (
    <>
      {isConnected ? (
        <FadeTransition className='flex min-h-[calc(100vh-122px)] flex-col items-stretch justify-start'>
          <div className='relative mx-auto grid max-w-[1276px] grid-cols-3 gap-5'>
            <Card gradient className='col-span-2 row-span-2 flex-1 p-5 min-h-[50vh]'>
              <Tabs defaultValue={DashboardPageTab.ASSETS} value={tab}>
                <TabsList className='mx-auto grid w-[372px] grid-cols-2 gap-4'>
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
                </TabsList>
                <TabsContent value={DashboardPageTab.ASSETS} className='mt-10'>
                  <AssetsTable />
                </TabsContent>
                <TabsContent value={DashboardPageTab.TRANSACTIONS} className='mt-10'>
                  <TransactionTable />
                </TabsContent>
              </Tabs>
            </Card>
            <EduInfoCard
              src={dashboardTabsHelper[tab].src}
              label={dashboardTabsHelper[tab].label}
              content={dashboardTabsHelper[tab].content}
            />
          </div>
        </FadeTransition>
      ) : (
        <NotConnected />
      )}
    </>
  );
}
