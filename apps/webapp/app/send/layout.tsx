'use client';
import { Card } from '@penumbra-zone/ui';
import { ReactNode } from 'react';
import { useTypedPathname } from '../../hooks/typed-pathname';
import { EduInfoCard } from '../../shared';
import { Tabs } from '../../shared/tabs';
import { sendMetadata, sendTabs, sendTabsHelper } from './constants';
import { SendTab } from './types';

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = useTypedPathname<SendTab>();

  return (
    <>
      <title>{sendMetadata[pathname].title}</title>
      <meta name='description' content={sendMetadata[pathname].descriptions as unknown as string} />
      <div className='relative mx-auto grid max-w-[1276px] grid-cols-3 gap-5'>
        <div />
        <Card gradient className='row-span-2 flex-1 p-5'>
          <Tabs tabs={sendTabs} activeTab={pathname} />
          {children}
        </Card>
        <EduInfoCard
          src={sendTabsHelper[pathname].src}
          label={sendTabsHelper[pathname].label}
          content={sendTabsHelper[pathname].content}
        />
      </div>
    </>
  );
}
