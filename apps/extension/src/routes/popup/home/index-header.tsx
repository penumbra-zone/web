import { HamburgerMenuIcon, PersonIcon } from '@radix-ui/react-icons';
import { usePopupNav } from '../../../utils/navigate';
import { PopupPath } from '../paths';
import { NetworksPopover } from './networks-popover';

export const IndexHeader = () => {
  const navigate = usePopupNav();
  return (
    <header className='top-0 z-40 w-full'>
      <div className='flex pt-4 items-center justify-between'>
        <HamburgerMenuIcon
          onClick={() => navigate(PopupPath.SETTINGS)}
          className='h-6 w-6 hover:opacity-50 cursor-pointer'
        />
        <NetworksPopover />
        <PersonIcon className='h-6 w-6 rounded-full border border-white hover:opacity-50 cursor-pointer' />
      </div>
    </header>
  );
};
