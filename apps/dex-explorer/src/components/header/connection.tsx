import { Button } from '@penumbra-zone/ui/Button';
import { ProviderPopover } from './provider-popover';
import { connectionStore } from '@/state/connection';
import { observer } from 'mobx-react-lite';

export const Connection = observer(() => {
  if (!connectionStore.connected) {
    return (
      <Button actionType='accent' onClick={() => void connectionStore.connect()}>
        Connect
      </Button>
    );
  }

  return <ProviderPopover />;
});
