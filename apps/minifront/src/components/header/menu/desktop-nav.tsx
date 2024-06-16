import { cn } from '@penumbra-zone/ui/lib/utils';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { usePagePath } from '../../../fetchers/page-path';
import { dashboardLink, headerLinks } from '../constants';
import { useNavigate } from 'react-router-dom';
import { itemStyle, linkStyle } from './nav-style';

export const DesktopNav = () => {
  const pathname = usePagePath();
  const navigate = useNavigate();
  return (
    <NavigationMenu.Root delayDuration={0} orientation='horizontal' className='w-full'>
      <NavigationMenu.List className='flex w-full grow flex-row justify-evenly'>
        {[dashboardLink, ...headerLinks].map(({ href, label, subLinks }) => (
          <NavigationMenu.Item
            key={href}
            className={cn(
              ...itemStyle,
              'hidden xl:inline-block',
              href === pathname || subLinks?.includes(pathname)
                ? 'text-muted bg-button-gradient-secondary rounded-lg'
                : undefined,
            )}
          >
            <NavigationMenu.Link className={cn(...linkStyle)} onSelect={() => navigate(href)}>
              {label}
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        ))}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
};
