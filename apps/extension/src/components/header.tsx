import { AccountsSheet } from './accounts-sheet'
import { SettingSheet } from './setting-sheet';

export const Header = () => {
  return (
    <header className='fixed top-0 z-40 w-full'>
      <div className='flex h-[68px] items-center justify-between px-9'>
        <SettingSheet />
        <AccountsSheet />
      </div>
    </header>
  );
};
