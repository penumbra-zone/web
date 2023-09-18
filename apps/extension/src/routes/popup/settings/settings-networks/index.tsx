import { CheckCircledIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useMemo, useState } from 'react';
import { Button, Input } from 'ui/components';
import { FadeTransition, SettingsHeader } from '../../../../shared';
import { usePopupNav } from '../../../../utils/navigate';
import { PopupPath } from '../../paths';
import { ShareGradientIcon } from './icon';

const networks = ['penumbra-testnet'];

export const SettingsNetworks = () => {
  const navigate = usePopupNav();
  const [search, setSearch] = useState('');

  const filteredNetworks = useMemo(() => {
    if (!search) return networks;
    return networks.filter(i => i.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-10'>
        <SettingsHeader title='Networks' />
        <div className='mx-auto h-[60px] w-[60px]'>
          <ShareGradientIcon />
        </div>
        <div className='flex flex-col gap-4 px-5'>
          <div className='relative flex w-full items-center justify-center gap-2'>
            <div className='absolute inset-y-0 left-3 flex items-center'>
              <MagnifyingGlassIcon className='h-5 w-5 text-muted-foreground' />
            </div>
            <Input
              className='pl-10'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Network name...'
            />
          </div>
          <div className='flex flex-col'>
            {filteredNetworks.map((i, index) => (
              <Button
                key={index}
                className='flex h-11 items-center justify-start gap-3 rounded-lg border border-border bg-background px-3 text-left'
                onClick={() =>
                  navigate(PopupPath.SETTINGS_NETWORK_NAME.replace(':name', i) as PopupPath)
                }
              >
                <CheckCircledIcon className='h-5 w-5 text-teal' />
                <p className='text-base-bold'>{i}</p>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </FadeTransition>
  );
};
