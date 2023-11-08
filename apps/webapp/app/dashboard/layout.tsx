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
    <div className='relative mx-auto grid md:gap-4 lg:grid-cols-3  xl:max-w-[1276px] xl:gap-5'>
      <Card gradient className='flex-1 md:p-4 lg:col-span-2 lg:row-span-2 xl:p-5'>
        <Tabs tabs={dashboardTabs} activeTab={pathname} className='mx-auto w-[75%] lg:w-[372px]' />
        {children}
      </Card>
      <EduInfoCard
        className='row-span-1'
        src={dashboardTabsHelper[pathname].src}
        label={dashboardTabsHelper[pathname].label}
        content={dashboardTabsHelper[pathname].content}
      />
    </div>
  );
}
