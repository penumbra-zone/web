'use client';
import { Button } from '@penumbra-zone/ui';
import React from 'react';
import { DappPath } from '../app/header/paths';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { useRouter } from 'next/navigation';

interface TabsProps {
  tabs: { title: string; active: boolean; href: DappPath }[];
  activeTab: DappPath;
}

export const Tabs = ({ tabs, activeTab }: TabsProps) => {
  const { push } = useRouter();

  return (
    <div className='inline-flex h-[52px] items-center justify-center rounded-lg bg-background px-2 mb-6'>
      {tabs.map(
        tab =>
          tab.active && (
            <Button
              className={cn(
                'w-full',
                activeTab !== tab.href && ' bg-transparent text-muted-foreground',
              )}
              size='md'
              key={tab.href}
              onClick={() => push(tab.href)}
            >
              {tab.title}
            </Button>
          ),
      )}
    </div>
  );
};
