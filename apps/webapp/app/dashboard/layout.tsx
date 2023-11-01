'use client';
import { Card } from '@penumbra-zone/ui';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { EduInfoCard } from '../../shared';
import { Tabs } from '../../shared/tabs';
import { DappPath } from '../header/paths';
import { dashboardTabs, dashboardTabsHelper } from './constants';
import { DashboardPageTab } from './types';

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className='relative mx-auto grid max-w-[1276px] grid-cols-3 gap-5 px-5'>
      <Card gradient className='col-span-2 row-span-2 flex-1 p-5'>
        <Tabs tabs={dashboardTabs} activeTab={pathname as DappPath} className='mx-auto w-[372px]' />
        {children}
      </Card>
      <EduInfoCard
        src={dashboardTabsHelper[pathname as DashboardPageTab].src}
        label={dashboardTabsHelper[pathname as DashboardPageTab].label}
        content={dashboardTabsHelper[pathname as DashboardPageTab].content}
      />
    </div>
  );
}
