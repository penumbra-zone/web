import { cn } from '@repo/ui/lib/utils';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { usePagePath } from '../../../fetchers/page-path';
import { dashboardLink, headerLinks } from '../constants';
import { CaretDownIcon } from '@radix-ui/react-icons';
import { useNavigate } from 'react-router-dom';
import { metadata } from '../../metadata/content';
import { itemStyle, linkStyle, triggerStyle, dropdownStyle } from './nav-style';

export const TabletNav = () => {
  const pathname = usePagePath();
  const navigate = useNavigate();

  return (
    <NavigationMenu.Root delayDuration={0}>
      <NavigationMenu.Item className={cn('w-[138px]', ...itemStyle, 'hidden md:block xl:hidden')}>
        <NavigationMenu.Trigger className={cn('group', 'text-left', 'text-muted', ...triggerStyle)}>
          {metadata[pathname].title}
          <CaretDownIcon className='inline-block text-right align-middle transition duration-200 group-data-[state=open]:-scale-y-100' />
        </NavigationMenu.Trigger>
        <NavigationMenu.Content className={cn('w-[138px]', ...dropdownStyle)}>
          {[dashboardLink, ...headerLinks].map(({ href, label }) => (
            <NavigationMenu.Item key={href} className={cn(...itemStyle)}>
              <NavigationMenu.Link className={cn(...linkStyle)} onSelect={() => navigate(href)}>
                {label}
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          ))}
        </NavigationMenu.Content>
      </NavigationMenu.Item>
      <NavigationMenu.Viewport className='absolute z-50' />
    </NavigationMenu.Root>
  );
};
