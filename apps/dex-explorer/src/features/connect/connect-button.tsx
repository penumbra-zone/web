import { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import { Wallet2 } from 'lucide-react';
import { Text } from '@penumbra-zone/ui/Text';
import { Button, ButtonProps } from '@penumbra-zone/ui/Button';
import { Density } from '@penumbra-zone/ui/Density';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { PenumbraClient } from '@penumbra-zone/client';
import { connectionStore } from '@/shared/model/connection';
import { useProviderManifests } from '@/shared/api/providerManifests';
import dynamic from 'next/dynamic';

const ConnectButtonInner = observer(
  ({
    actionType = 'accent',
    variant = 'default',
  }: {
    actionType?: ButtonProps['actionType'];
    variant?: 'default' | 'minimal' | 'mobile';
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { data: providerManifests } = useProviderManifests();

    const providerOrigins = useMemo(() => Object.keys(PenumbraClient.getProviders()), []);

    const onConnectClick = () => {
      if (providerOrigins.length > 1) {
        setIsOpen(true);
      } else if (providerOrigins.length === 1 && providerOrigins[0]) {
        connect(providerOrigins[0]);
      }
    };

    const connect = (provider: string) => {
      void connectionStore.connect(provider);
    };

    return (
      <>
        <Density variant={variant === 'default' ? 'sparse' : 'compact'}>
          {providerOrigins.length === 0 ? (
            <Button
              icon={Wallet2}
              actionType={actionType}
              iconOnly={variant === 'mobile'}
              onClick={() =>
                window.open('https://praxwallet.com/', '_blank', 'noopener,noreferrer')
              }
            >
              Install Prax
            </Button>
          ) : (
            <Button
              icon={Wallet2}
              iconOnly={variant === 'mobile'}
              actionType={actionType}
              onClick={onConnectClick}
            >
              Connect wallet
            </Button>
          )}
        </Density>

        <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <Dialog.Content title='Choose wallet'>
            <Dialog.RadioGroup>
              <div className='flex flex-col gap-2 pt-1'>
                {Object.entries(providerManifests ?? {}).map(([key, manifest]) => (
                  <Dialog.RadioItem
                    key={key}
                    value={key}
                    title={<Text color='text.primary'>{manifest.name}</Text>}
                    description={
                      <Text detail color='text.secondary'>
                        {manifest.description}
                      </Text>
                    }
                    startAdornment={
                      <Image
                        height={32}
                        width={32}
                        src={URL.createObjectURL(manifest.icons['128'])}
                        alt={manifest.name}
                      />
                    }
                    onSelect={() => connect(key)}
                  />
                ))}
              </div>
            </Dialog.RadioGroup>
          </Dialog.Content>
        </Dialog>
      </>
    );
  },
);

// Need to disable SSR given usage of window access in getProviders()
export const ConnectButton = dynamic(() => Promise.resolve(ConnectButtonInner), {
  ssr: false,
});
