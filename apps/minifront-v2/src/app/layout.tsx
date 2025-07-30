import { Outlet } from 'react-router-dom';
import { Display } from '@penumbra-zone/ui/Display';
import { HeadTag } from './head-tag';
import { Header, SyncBar } from '@/widgets/header';
import { BackgroundProvider } from '@/shared/contexts/background-context';
import { PageBackground } from '@/shared/components/page-background';
import { SyncingDialog } from '@/widgets/sync-dialog';

export const Layout = () => {
  return (
    <BackgroundProvider>
      <Display>
        <HeadTag />
        <PageBackground />

        <SyncBar />

        <div className='flex w-full flex-col items-center'>
          <div className='w-full pt-20'>
            <Header />
            <Outlet />
          </div>
        </div>

        <SyncingDialog />
      </Display>
    </BackgroundProvider>
  );
};
