'use client';
import { Card } from '@penumbra-zone/ui';
import { ReactNode } from 'react';
import { useTypedPathname } from '../../hooks/typed-pathname';
import { EduInfoCard } from '../../shared';
import { Tabs } from '../../shared/tabs';
import { sendTabs, sendTabsHelper } from './constants';
import { SendTab } from './types';

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = useTypedPathname<SendTab>();

  return (
    <div className='relative mx-auto grid md:grid-cols-2 md:gap-4 xl:max-w-[1276px] xl:grid-cols-3 xl:gap-5'>
      <div className='hidden xl:block' />
      <Card gradient className='row-span-2 flex-1 md:p-4 xl:p-5'>
        <Tabs tabs={sendTabs} activeTab={pathname} />
        {children}
      </Card>
      <EduInfoCard
        src={sendTabsHelper[pathname].src}
        label={sendTabsHelper[pathname].label}
        content={sendTabsHelper[pathname].content}
      />
    </div>
  );
}
