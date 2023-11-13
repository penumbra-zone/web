import { Card } from '@penumbra-zone/ui';
import { dashboardTabs, dashboardTabsHelper } from './constants';
import { Outlet } from 'react-router-dom';
import { EduInfoCard } from '../shared/edu-panels/edu-info-card.tsx';
import { Tabs } from '../shared/tabs.tsx';
import { usePagePath } from '../../fetchers/page-path.ts';
import { DashboardTab } from './types.ts';

export const DashboardLayout = () => {
  const pathname = usePagePath<DashboardTab>();

  return (
    <div className='relative mx-auto grid gap-6 md:gap-4 lg:grid-cols-3  xl:max-w-[1276px] xl:gap-5'>
      <Card gradient className='flex-1 p-5 md:p-4 lg:col-span-2 lg:row-span-2 xl:p-5'>
        <Tabs tabs={dashboardTabs} activeTab={pathname} className='mx-auto w-[75%] lg:w-[372px]' />
        <Outlet />
      </Card>
      <EduInfoCard
        className='row-span-1'
        src={dashboardTabsHelper[pathname].src}
        label={dashboardTabsHelper[pathname].label}
        content={dashboardTabsHelper[pathname].content}
      />
    </div>
  );
};
