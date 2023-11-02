'use client';
import { Card } from '@penumbra-zone/ui';
import { ReactNode } from 'react';
import { useTypedPathname } from '../../hooks/typed-pathname';
import { EduInfoCard } from '../../shared';
import { Tabs } from '../../shared/tabs';
import { dashboardMetadata, dashboardTabs, dashboardTabsHelper } from './constants';
import { DashboardTab } from './types';

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = useTypedPathname<DashboardTab>();

  return (
    <>
      <title>{dashboardMetadata[pathname].title}</title>
      <meta
        name='description'
        content={dashboardMetadata[pathname].description as unknown as string}
      />
      <div className='relative mx-auto grid max-w-[1276px] grid-cols-3 gap-5 px-5'>
        <Card gradient className='col-span-2 row-span-2 flex-1 p-5'>
          <Tabs tabs={dashboardTabs} activeTab={pathname} className='mx-auto w-[372px]' />
          {children}
        </Card>
        <EduInfoCard
          src={dashboardTabsHelper[pathname].src}
          label={dashboardTabsHelper[pathname].label}
          content={dashboardTabsHelper[pathname].content}
        />
      </div>
    </>
  );
}
