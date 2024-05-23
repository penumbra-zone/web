import { Card } from '@penumbra-zone/ui/components/ui/card';
import { dashboardTabs, dashboardTabsHelper } from './constants';
import { Outlet } from 'react-router-dom';
import { EduInfoCard } from '../shared/edu-panels/edu-info-card';
import { Tabs } from '../shared/tabs';
import { usePagePath } from '../../fetchers/page-path';
import { DashboardTab } from './types';
import { RestrictMaxWidth } from '../shared/restrict-max-width';
import { GRID_LAYOUT_GAP_CLASSES } from '../constants';

export const DashboardLayout = () => {
  const pathname = usePagePath<DashboardTab>();

  return (
    <RestrictMaxWidth>
      <div className={`grid lg:grid-cols-3 ${GRID_LAYOUT_GAP_CLASSES}`}>
        <Card
          gradient
          className='order-2 flex flex-1 flex-col p-5 md:p-4 lg:order-1 lg:col-span-2 lg:row-span-2 xl:p-5'
        >
          <Tabs tabs={dashboardTabs} activeTab={pathname} className='mx-auto w-full md:w-[70%]' />
          <Outlet />
        </Card>
        <EduInfoCard
          className='order-1 row-span-1 lg:order-2'
          src={dashboardTabsHelper[pathname].src}
          label={dashboardTabsHelper[pathname].label}
          content={dashboardTabsHelper[pathname].content}
        />
      </div>
    </RestrictMaxWidth>
  );
};
