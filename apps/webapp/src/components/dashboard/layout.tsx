import { Card } from '@penumbra-zone/ui';
import { dashboardTabs, dashboardTabsHelper } from './constants';
import { Outlet } from 'react-router-dom';
import { EduInfoCard } from '../shared/edu-panels/edu-info-card';
import { Tabs } from '../shared/tabs';
import { usePagePath } from '../../fetchers/page-path';
import { DashboardTab } from './types';

export const DashboardLayout = () => {
  const pathname = usePagePath<DashboardTab>();

  return (
    <div className='grid gap-6 md:gap-4 lg:grid-cols-3 xl:gap-5'>
      <Card
        gradient
        className='order-2 flex-1 p-5 md:p-4 lg:order-1 lg:col-span-2 lg:row-span-2 xl:p-5'
      >
        <Tabs tabs={dashboardTabs} activeTab={pathname} className='mx-auto w-[75%] lg:w-[372px]' />
        <Outlet />
      </Card>
      <EduInfoCard
        className='order-1 row-span-1 lg:order-2'
        src={dashboardTabsHelper[pathname].src}
        label={dashboardTabsHelper[pathname].label}
        content={dashboardTabsHelper[pathname].content}
      />
    </div>
  );
};
