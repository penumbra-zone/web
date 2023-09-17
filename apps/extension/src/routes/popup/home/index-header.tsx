import { HamburgerMenuIcon, PersonIcon } from '@radix-ui/react-icons';
import { usePopupNav } from '../../../utils/navigate';
import { PopupPath } from '../paths';
import { NetworksPopover } from './networks-popover';

export const IndexHeader = () => {
  const navigate = usePopupNav();
  return (
    <header className='top-0 z-40 w-full'>
      <div className='flex items-center justify-between pt-4'>
        <HamburgerMenuIcon
          onClick={() => navigate(PopupPath.SETTINGS)}
          className='h-6 w-6 cursor-pointer hover:opacity-50'
        />
        <NetworksPopover />
        <PersonIcon
          className='h-6 w-6 cursor-pointer rounded-full border border-white hover:opacity-50'
          onClick={() => navigate(PopupPath.ACCOUNTS)}
        />
      </div>
    </header>
  );
};
