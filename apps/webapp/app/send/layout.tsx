'use client';
import { Card } from '@penumbra-zone/ui';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { EduInfoCard } from '../../shared';
import { Tabs } from '../../shared/tabs';
import { DappPath } from '../header/paths';
import { sendTabs, sendTabsHelper } from './constants';
import { SendPageTab } from './types';

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className='relative mx-auto grid max-w-[1276px] grid-cols-3 gap-5'>
      <div />
      <Card gradient className='row-span-2 flex-1 p-5'>
        <Tabs tabs={sendTabs} activeTab={pathname as DappPath} />
        {children}
      </Card>
      <EduInfoCard
        src={sendTabsHelper[pathname as SendPageTab].src}
        label={sendTabsHelper[pathname as SendPageTab].label}
        content={sendTabsHelper[pathname as SendPageTab].content}
      />
    </div>
  );
}
