import { Outlet } from 'react-router-dom';
import { Display } from '@penumbra-zone/ui/Display';
import { HeadTag } from './head-tag';
import { Header } from '@widgets/header';
import { SyncBar } from '@widgets/header/sync-bar';

export const Layout = () => {
  return (
    <Display>
      <HeadTag />

      <SyncBar />

      <div className='flex w-full flex-col items-center'>
        <div className='w-full max-w-[1136px] px-0 md:px-4'>
          <Header />
          <Outlet />
        </div>
      </div>

      {/* TODO: add syncing dialog to v2 */}
      {/* <SyncingDialog /> */}
    </Display>
  );
};
