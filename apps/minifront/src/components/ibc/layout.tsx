import { Card } from '@penumbra-zone/ui-deprecated/components/ui/card';
import { Tabs } from '../shared/tabs.tsx';
import { usePagePath } from '../../fetchers/page-path.ts';
import { ShieldTab, shieldTabs } from './tabs.ts';
import { PagePath } from '../metadata/paths.ts';
import { InterchainUi } from './deposit-manual/interchain-ui.tsx';
import { IbcOutForm } from './withdraw/ibc-out-form.tsx';
import { DepositSkip } from './deposit-skip';

export const IbcLayout = () => {
  const pathname = usePagePath<ShieldTab>();

  return (
    <div className='mx-auto w-full max-w-[500px]'>
      <Card gradient className='flex flex-col gap-4'>
        <Tabs tabs={shieldTabs} activeTab={pathname} />
        <div className='flex flex-col items-center justify-center'>
          {pathname === PagePath.DEPOSIT_SKIP && <DepositSkip />}
          {pathname === PagePath.DEPOSIT_MANUAL && <InterchainUi />}
          {pathname === PagePath.WITHDRAW && <IbcOutForm />}
        </div>
      </Card>
    </div>
  );
};
