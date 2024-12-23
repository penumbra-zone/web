import { cn } from '@penumbra-zone/ui-deprecated/lib/utils';
import { DesktopNav } from './desktop-nav';
import { MobileNav } from './mobile-nav';
import { ProviderMenu } from './provider';
import { TabletNav } from './tablet-nav';

export const MenuBar = () => {
  return (
    <div className={cn('flex w-full items-center justify-between sm:gap-8 list-none')}>
      <MobileNav />
      <DesktopNav />
      <TabletNav />
      <ProviderMenu />
    </div>
  );
};
