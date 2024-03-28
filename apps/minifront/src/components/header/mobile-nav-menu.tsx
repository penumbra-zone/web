import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@penumbra-zone/ui/components/ui/sheet';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { headerLinks } from './constants';
import { Link } from 'react-router-dom';

export const MobileNavMenu = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <HamburgerMenuIcon className='z-10 size-6 cursor-pointer text-muted hover:opacity-50' />
      </SheetTrigger>
      <SheetContent side='left' className='w-[311px] bg-charcoal-secondary p-5 '>
        <SheetHeader className='z-10' />
        <div className='relative z-10 flex flex-col gap-5'>
          {headerLinks
            .filter(link => link.active)
            .map(link => (
              <SheetTrigger key={link.href} asChild>
                <Link
                  to={link.href}
                  className='flex select-none items-center gap-2 p-[10px] font-bold text-muted-foreground'
                >
                  {link.mobileIcon}
                  <p className='pt-[2px] text-lg'>{link.label}</p>
                </Link>
              </SheetTrigger>
            ))}
        </div>
        <div className='absolute inset-0 z-0 bg-card-radial opacity-20' />
      </SheetContent>
    </Sheet>
  );
};
