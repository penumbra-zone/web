import { Sheet, SheetContent, SheetHeader, SheetTrigger } from '@penumbra-zone/ui';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { headerLinks } from './constants';
import { Link } from 'react-router-dom';

export const MobileNavMenu = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <HamburgerMenuIcon className='w-6 h-6 text-muted cursor-pointer hover:opacity-50' />
      </SheetTrigger>
      <SheetContent side='left' className='w-[311px] bg-charcoal-secondary p-5 '>
        <SheetHeader className='z-10' />
        <div className='flex flex-col gap-5 relative z-10'>
          {headerLinks
            .filter(link => link.active)
            .map(link => (
              <SheetTrigger key={link.href} asChild>
                <Link
                  to={link.href}
                  className='font-bold p-[10px] select-none flex items-center text-muted-foreground gap-2'
                >
                  {link.icon}
                  <p  className='pt-[2px]'>{link.label}</p>
                </Link>
              </SheetTrigger>
            ))}
        </div>
        <div className='absolute inset-0 z-0 bg-card-radial opacity-20' />
      </SheetContent>
    </Sheet>
  );
};
