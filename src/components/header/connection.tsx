import { Button } from '@penumbra-zone/ui/Button';
import { useConnect } from '@/utils/penumbra/useConnect.ts';
import { ProviderPopover } from './provider-popover.tsx';

export const Connection = () => {
  const { connected, connect } = useConnect();

  if (!connected) {
    return (
      <Button actionType='accent' onClick={() => void connect()}>Connect</Button>
    );
  }

  return <ProviderPopover />
};
