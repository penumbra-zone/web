import { observer } from 'mobx-react-lite';
import { connectionStore } from '@/shared/model/connection';
import { ProviderPopover } from './provider-popover';
import { ConnectButton } from './connect-button';

export const Connection = observer(() => {
  if (!connectionStore.connected) {
    return <ConnectButton />;
  }

  return <ProviderPopover />;
});
