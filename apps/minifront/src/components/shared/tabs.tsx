import { Button } from '@penumbra-zone/ui/components/ui/button';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { PagePath } from '../metadata/paths';
import { useNavigate } from 'react-router-dom';

interface TabsProps {
  tabs: { title: string; active: boolean; href: PagePath }[];
  activeTab: PagePath;
  className?: string;
}

export const Tabs = ({ tabs, activeTab, className }: TabsProps) => {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        'inline-flex h-[52px] items-center justify-center rounded-lg bg-background px-2 mb-6 gap-3',
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
              onClick={() => navigate(tab.href)}
            >
              {tab.title}
            </Button>
          ),
      )}
    </div>
  );
};
