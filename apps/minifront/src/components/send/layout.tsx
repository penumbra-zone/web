import { Card } from '@penumbra-zone/ui/components/ui/card';
import { sendTabs, sendTabsHelper } from './constants';
import { SendTab } from './types';
import { usePagePath } from '../../fetchers/page-path';
import { Tabs } from '../shared/tabs';
import { Outlet } from 'react-router-dom';
import { EduInfoCard } from '../shared/edu-panels/edu-info-card';
import { RestrictMaxWidth } from '../shared/restrict-max-width';

export const SendLayout = () => {
  const pathname = usePagePath<SendTab>();

  return (
    <RestrictMaxWidth>
      <div className='grid grid-std-spacing md:grid-cols-2 xl:grid-cols-3'>
        <div className='hidden xl:order-1 xl:block' />
        <Card
          gradient
          className='order-2 row-span-2 flex flex-1 flex-col p-5 md:order-1 md:p-4 xl:p-5'
        >
          <Tabs tabs={sendTabs} activeTab={pathname} />
          <Outlet />
        </Card>
        <EduInfoCard
          className='order-1 row-span-1 md:order-2'
          src={sendTabsHelper[pathname].src}
          label={sendTabsHelper[pathname].label}
          content={sendTabsHelper[pathname].content}
        />
      </div>
    </RestrictMaxWidth>
  );
};
