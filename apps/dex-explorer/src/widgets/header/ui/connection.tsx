import { observer } from 'mobx-react-lite';
import { connectionStore } from '@/shared/model/connection';
import { ConnectButton } from './connect-button';
import { SubaccountSelector } from '@/widgets/header/ui/subaccount-selector';

export const Connection = observer(() => {
  if (!connectionStore.connected) {
    return <ConnectButton />;
  }

  return <SubaccountSelector />;
});
