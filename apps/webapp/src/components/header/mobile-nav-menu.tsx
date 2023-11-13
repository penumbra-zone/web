import {
  Button,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@penumbra-zone/ui';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';

export const MobileNavMenu = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <HamburgerMenuIcon className='w-6 h-6 text-muted' />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader />
        asas
      </SheetContent>
    </Sheet>
  );
};
