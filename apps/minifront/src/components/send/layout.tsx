import { Card } from '@penumbra-zone/ui/components/ui/card';
import { sendTabs, sendTabsHelper } from './constants';
import { SendTab } from './types';
import { usePagePath } from '../../fetchers/page-path';
import { Tabs } from '../shared/tabs';
import { Outlet } from 'react-router-dom';
import { EduInfoCard } from '../shared/edu-panels/edu-info-card';

export const SendLayout = () => {
  const pathname = usePagePath<SendTab>();

  return (
    <div className='grid gap-6 md:grid-cols-2 md:gap-4 xl:grid-cols-3 xl:gap-5'>
      <div className='hidden xl:order-1 xl:block' />
      <Card
        gradient
        className='order-2 row-span-2 flex flex-1 flex-col p-5 md:order-1 md:p-4 xl:p-5'
      >
        <Tabs tabs={sendTabs} activeTab={pathname} />
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
