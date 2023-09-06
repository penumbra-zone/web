import { AccountsSheet } from './accounts-sheet';
import { SettingSheet } from './setting-sheet';

export const Header = () => {
  return (
    <header className='top-0 z-40 w-full'>
      <div className='flex h-[68px] items-center justify-between px-7'>
        <SettingSheet />
        <AccountsSheet />
      </div>
    </header>
  );
};
