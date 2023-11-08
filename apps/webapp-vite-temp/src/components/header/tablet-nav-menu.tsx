import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@penumbra-zone/ui';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { PagePath } from '../metadata/paths.ts';
import { headerLinks, transactionLink } from './constants.ts';

export const TabletNavMenu = () => {
  const location = useLocation();
  const pathname = location.pathname as PagePath;

  return (
    <div className='hidden md:block xl:hidden'>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className='w-[188px] rounded-lg border border-light-brown text-muted'>
              {
                [...headerLinks, transactionLink].find(link => link.subLinks?.includes(pathname))
                  ?.label
              }
            </NavigationMenuTrigger>
            <NavigationMenuContent className='w-[188px]'>
              {headerLinks
                .filter(link => link.active)
                .map(link => (
                  <Link key={link.href} to={link.href} className='border-b'>
                    <NavigationMenuLink
                      className={cn(navigationMenuTriggerStyle(), 'border-b border-brown')}
                    >
                      {link.label}
                    </NavigationMenuLink>
                  </Link>
                ))}
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};
