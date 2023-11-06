'use client';
import { Button } from '@penumbra-zone/ui';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { useRouter } from 'next/navigation';
import { DappPath } from './header/types';

interface TabsProps {
  tabs: { title: string; active: boolean; href: DappPath }[];
  activeTab: DappPath;
  className?: string;
}

export const Tabs = ({ tabs, activeTab, className }: TabsProps) => {
  const { push } = useRouter();

  return (
    <div
      className={cn(
        'inline-flex h-[52px] items-center justify-center rounded-lg bg-background md:px-4 xl:px-2 mb-6 gap-3',
        className,
      )}
    >
      {tabs.map(
        tab =>
          tab.active && (
            <Button
              className={cn(
                'w-full transition-all',
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
