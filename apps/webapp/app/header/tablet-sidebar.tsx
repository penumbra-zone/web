'use client';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@penumbra-zone/ui';
import Link from 'next/link';
import { headerLinks } from './constants';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { useTypedPathname } from '../../hooks/typed-pathname';
import { DappPath } from '../../shared/header/types';

export const TabletSidebar = () => {
  const pathname = useTypedPathname<DappPath>();
  return (
    <div className='hidden md:block xl:hidden'>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className='w-[188px] border rounded-lg border-light-brown text-muted'>
              {headerLinks.find(link => link.subLinks?.includes(pathname))?.label}
            </NavigationMenuTrigger>
            <NavigationMenuContent className='w-[188px]'>
              {headerLinks
                .filter(link => link.active)
                .map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    legacyBehavior
                    passHref
                    className='border-b'
                  >
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
