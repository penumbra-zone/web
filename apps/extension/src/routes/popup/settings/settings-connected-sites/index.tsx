import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useMemo, useState } from 'react';
import { FadeTransition, Input } from '@penumbra-zone/ui';
import { LinkGradientIcon } from '../../../../icons';
import { SettingsHeader } from '../../../../shared';
import { ConnectedSitesActionPopover } from './connected-sites-action-popover';
import { useStore } from '../../../../state';
import { connectedSitesSelector } from '../../../../state/connected-sites';

export const SettingsConnectedSites = () => {
  const { connectedSites } = useStore(connectedSitesSelector);
  const [search, setSearch] = useState('');

  const filteredSites = useMemo(() => {
    if (!search) return connectedSites;
    return connectedSites.filter(i => i.toLowerCase().includes(search.toLowerCase()));
  }, [search, connectedSites]);

  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-6'>
        <SettingsHeader title='Connected sites' />
        <div className='mx-auto h-20 w-20'>
          <LinkGradientIcon />
        </div>
        <div className='flex flex-col gap-4 px-[30px]'>
          <div className='relative flex w-full items-center justify-center gap-4'>
            <div className='absolute inset-y-0 left-3 flex items-center'>
              <MagnifyingGlassIcon className='h-5 w-5 text-muted-foreground' />
            </div>
            <Input
              className='pl-10'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Dapp name...'
            />
          </div>
          <div className='flex flex-col gap-2'>
            {filteredSites.map(origin => (
              <div
                key={origin}
                className='flex items-center justify-between rounded-lg border bg-background px-3 py-[14px]'
              >
                <a href={origin} target='_blank' rel='noreferrer noopener'>
                  {origin}
                </a>
                <ConnectedSitesActionPopover origin={origin} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </FadeTransition>
  );
};
