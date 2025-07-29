import React from 'react';
import { observer } from 'mobx-react-lite';
import { StakingAssetsCard } from './staking-assets-card';
import { DelegationTokensCard } from './delegation-tokens-card';
import { DelegateDialog } from './delegate-dialog';

export const Stake = observer((): React.ReactNode => {
  return (
    <div className='flex w-full flex-col items-center'>
      <div className='flex flex-col w-full flex-1 gap-4 max-w-screen-lg'>
        <StakingAssetsCard showInfoButton={true} />
        <DelegationTokensCard showInfoButton={true} />
      </div>

      {/* Delegate/Undelegate Dialog */}
      <DelegateDialog />
    </div>
  );
});
