import { observer } from 'mobx-react-lite';
import { connectionStore } from '@/shared/model/connection';
import { ConnectButton } from '@/features/connect/connect-button';
import { SubaccountSelector } from '@/widgets/header/ui/subaccount-selector';

export interface ConnectionProps {
  mobile?: boolean;
}

export const Connection = observer(({ mobile }: ConnectionProps) => {
  if (!connectionStore.connected) {
    return <ConnectButton variant={mobile ? 'mobile' : 'default'} />;
  }

  if (mobile) {
    return (
      <div className='max-w-32'>
        <SubaccountSelector mobile />
      </div>
    );
  }

  return <SubaccountSelector />;
});
