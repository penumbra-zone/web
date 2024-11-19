import { useState } from 'react';
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

export const ConnectButton = observer(
  ({ actionType = 'accent' }: { actionType?: ButtonProps['actionType'] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { data: providers } = useProviderManifests();

    const onClick = () => {
      const providers = PenumbraClient.getProviders();
      const length = Object.keys(providers).length;
      const first = Object.keys(providers)[0];

      if (length > 1) {
        setIsOpen(true);
      } else if (length === 1 && first) {
        connect(first);
      }
    };

    const connect = (provider: string) => {
      void connectionStore.connect(provider);
    };

    return (
      <>
        <Density sparse>
          <Button icon={Wallet2} actionType={actionType} onClick={onClick}>
            Connect wallet
          </Button>
        </Density>

        <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <Dialog.Content title='Choose wallet'>
            <Dialog.RadioGroup>
              <div className='flex flex-col gap-2 pt-1'>
                {Object.entries(providers ?? {}).map(([key, manifest]) => (
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
