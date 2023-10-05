'use client';

import { useState } from 'react';
import { Card, FadeTransition, Tabs, TabsContent, TabsList, TabsTrigger } from 'ui';
import { SwapPageTab } from './types';
import { EduInfoCard } from '../../shared';
import { SwapForm } from './swap-form';

export default function Page() {
  const [tab, setTab] = useState<SwapPageTab>(SwapPageTab.MARKET);
  return (
    <FadeTransition className='flex min-h-[calc(100vh-122px)] flex-col items-stretch justify-start'>
      <div className='relative mx-auto grid max-w-[1276px] grid-cols-3 gap-5'>
        <div />
        <Card gradient className='row-span-2 flex-1 p-5'>
          <Tabs defaultValue={SwapPageTab.MARKET} className='w-full' value={tab}>
            <TabsList className='grid w-full grid-cols-3 gap-4'>
              <TabsTrigger value={SwapPageTab.MARKET} onClick={() => setTab(SwapPageTab.MARKET)}>
                Market
              </TabsTrigger>
              <TabsTrigger
                value={SwapPageTab.LIMIT}
                onClick={() => setTab(SwapPageTab.LIMIT)}
                disabled
              >
                Limit
              </TabsTrigger>
              <TabsTrigger
                value={SwapPageTab.TWAP}
                onClick={() => setTab(SwapPageTab.TWAP)}
                disabled
              >
                TWAP
              </TabsTrigger>
            </TabsList>
            <TabsContent value={SwapPageTab.MARKET}>
              <SwapForm />
            </TabsContent>
            <TabsContent value={SwapPageTab.LIMIT}></TabsContent>
            <TabsContent value={SwapPageTab.TWAP}></TabsContent>
          </Tabs>
        </Card>
        <EduInfoCard src='/incognito.svg' label='Shielded Swaps' />
      </div>
    </FadeTransition>
  );
}
