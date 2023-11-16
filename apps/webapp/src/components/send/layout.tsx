'use client';
import { Card } from '@penumbra-zone/ui';
import { sendTabs, sendTabsHelper } from './constants';
import { SendTab } from './types';
import { usePagePath } from '../../fetchers/page-path.ts';
import { Tabs } from '../shared/tabs.tsx';
import { Outlet } from 'react-router-dom';
import { EduInfoCard } from '../shared/edu-panels/edu-info-card.tsx';

export const SendLayout = () => {
  const pathname = usePagePath<SendTab>();

  return (
    <div className='relative mx-auto grid gap-6 md:grid-cols-2 md:gap-4 xl:max-w-[1276px] xl:grid-cols-3 xl:gap-5'>
      <div className='hidden xl:block xl:order-' />
      <Card gradient className='row-span-2 flex-1 order-2 md:order-1 p-5 md:p-4 xl:p-5'>
        <Tabs tabs={sendTabs} activeTab={pathname} className='mx-auto w-[75%] lg:w-[372px]' />
        <Outlet />
      </Card>
      <EduInfoCard
        className='order-1 md:order-2'
        src={sendTabsHelper[pathname].src}
        label={sendTabsHelper[pathname].label}
        content={sendTabsHelper[pathname].content}
      />
    </div>
  );
};
