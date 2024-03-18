import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@penumbra-zone/ui/components/ui/navigation-menu';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { useNavigate } from 'react-router-dom';
import { headerLinks, transactionLink } from './constants';
import { usePagePath } from '../../fetchers/page-path';

export const TabletNavMenu = () => {
  const pathname = usePagePath();
  const navigate = useNavigate();

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
                  <NavigationMenuLink
                    key={link.href}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      'border-b border-brown cursor-pointer',
                    )}
                    onClick={() => navigate(link.href)}
                  >
                    {link.label}
                  </NavigationMenuLink>
                ))}
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};
