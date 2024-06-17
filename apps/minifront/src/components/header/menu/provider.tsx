import { cn } from '@penumbra-zone/ui/lib/utils';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { getChainId } from '../../../fetchers/chain-id';
import { useCallback, useEffect, useState } from 'react';
import { getPraxManifest, getPraxOrigin } from '@penumbra-zone/client/prax';
import { itemStyle, triggerStyle, dropdownStyle, linkStyle } from './nav-style';
import { Link1Icon } from '@radix-ui/react-icons';

export const ProviderMenu = () => {
  const [chainId, setChainId] = useState<string | undefined>();
  const [providerManifest, setProviderManifest] = useState<ProviderManifest>();
  const [providerOrigin] = useState(getPraxOrigin());

  const [manifestIconUnavailable, setManifestIconUnavailable] = useState<boolean>();

  const disconnect = useCallback(() => {
    console.log('unimplemented');
    //window[Symbol.for('penumbra')][providerOrigin].disconnect(),
  }, [providerOrigin]);

  useEffect(() => {
    void getPraxManifest().then(m => setProviderManifest(m as ProviderManifest));
    void getChainId().then(setChainId);
  }, []);

  if (!providerManifest) return null;

  return (
    <NavigationMenu.Root className='max-w-96'>
      <NavigationMenu.Item className={cn(...itemStyle)}>
        <NavigationMenu.Trigger
          className={cn(
            'group',
            ...triggerStyle,
            'flex flex-row gap-2 place-items-center justify-evenly whitespace-nowrap',
          )}
        >
          {manifestIconUnavailable ? (
            <Link1Icon className='text-teal-500' />
          ) : (
            <img
              id='provider-icon'
              className={cn('w-[1.5em]', 'max-w-none', 'h-[1.5em]')}
              src={String(new URL(providerManifest.icons['128'], providerOrigin))}
              alt={`${providerManifest.name} Icon`}
              onError={() => setManifestIconUnavailable(true)}
            />
          )}
          {chainId}
        </NavigationMenu.Trigger>
        <NavigationMenu.Content className={cn(...dropdownStyle, 'w-64')}>
          <NavigationMenu.Item className={cn(...itemStyle)}>
            <NavigationMenu.Link className={cn(...linkStyle, 'p-0', 'leading-normal')}>
              <div className='ml-4 text-muted-foreground'>
                <span className='font-headline text-muted'>
                  {providerManifest.name} {providerManifest.version}
                </span>
                <p>{providerManifest.description}</p>
              </div>
            </NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item className={cn(...itemStyle)}>
            <NavigationMenu.Link hidden className={cn(...linkStyle)} onSelect={disconnect}>
              Disconnect
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu.Content>
      </NavigationMenu.Item>
      <NavigationMenu.Viewport className='absolute z-50' />
    </NavigationMenu.Root>
  );
};

interface ProviderManifest {
  options_ui?: {
    page: string;
  };
  options_page?: string;
  homepage_url: string;
  name: string;
  id: string;
  version: string;
  description: string;
  icons: {
    ['128']: string;
  };
}
