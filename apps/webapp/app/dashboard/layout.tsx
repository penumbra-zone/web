'use client';
import { Card } from '@penumbra-zone/ui';
import { ReactNode } from 'react';
import { useTypedPathname } from '../../hooks/typed-pathname';
import { EduInfoCard } from '../../shared';
import { Tabs } from '../../shared/tabs';
import { dashboardTabs, dashboardTabsHelper } from './constants';
import { DashboardTab } from './types';

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = useTypedPathname<DashboardTab>();

  return (
    <div className='relative mx-auto grid grid-cols-3 md:gap-4 xl:max-w-[1276px] xl:gap-5'>
      <Card gradient className='col-span-2 row-span-2 flex-1 md:p-4 xl:p-5'>
        <Tabs tabs={dashboardTabs} activeTab={pathname} className='mx-auto w-full lg:w-[372px]' />
        {children}
      </Card>
      <EduInfoCard
        src={dashboardTabsHelper[pathname].src}
        label={dashboardTabsHelper[pathname].label}
        content={dashboardTabsHelper[pathname].content}
      />
    </div>
  );
}
