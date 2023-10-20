'use client';

import { useState } from 'react';
import { Card, FadeTransition, Tabs, TabsContent, TabsList, TabsTrigger } from '@penumbra-zone/ui';
import { EduInfoCard } from '../../shared';
import { sendTabsHelper } from './constants';
import { SendPageTab } from './types';
import dynamic from 'next/dynamic';
const IbcForm = dynamic(() => import('./ibc-form'), {
  ssr: false,
});
const SendForm = dynamic(() => import('./send-form'), {
  ssr: false,
});

export default function Page() {
  const [tab, setTab] = useState<SendPageTab>(SendPageTab.SEND);

  return (
    <FadeTransition className='flex min-h-[calc(100vh-122px)] flex-col items-stretch justify-start'>
      <div className='relative mx-auto grid max-w-[1276px] grid-cols-3 gap-5'>
        <div />
        <Card gradient className='row-span-2 flex-1 p-5'>
          <Tabs defaultValue={SendPageTab.SEND} className='w-full' value={tab}>
            <TabsList className='grid w-full grid-cols-3 gap-4'>
              <TabsTrigger value={SendPageTab.SEND} onClick={() => setTab(SendPageTab.SEND)}>
                Send
              </TabsTrigger>
              <TabsTrigger value={SendPageTab.RECEIVE} onClick={() => setTab(SendPageTab.RECEIVE)}>
                Receive
              </TabsTrigger>
              <TabsTrigger value={SendPageTab.IBC} onClick={() => setTab(SendPageTab.IBC)}>
                IBC
              </TabsTrigger>
            </TabsList>
            <TabsContent value={SendPageTab.SEND}>
              <SendForm />
            </TabsContent>
            <TabsContent value={SendPageTab.RECEIVE}></TabsContent>
            <TabsContent value={SendPageTab.IBC}>
              <IbcForm />
            </TabsContent>
          </Tabs>
        </Card>
        <EduInfoCard src={sendTabsHelper[tab].src} label={sendTabsHelper[tab].label} />
      </div>
    </FadeTransition>
  );
}
