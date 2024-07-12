import { cn } from '@repo/ui/lib/utils';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { getChainId } from '../../../fetchers/chain-id';
import { useEffect, useState } from 'react';
import { itemStyle, triggerStyle, dropdownStyle, linkStyle, viewportStyle } from './nav-style';
import { Link1Icon, LinkBreak1Icon } from '@radix-ui/react-icons';
import { penumbraClient } from '../../../prax';

export const ProviderMenu = () => {
  const [chainId, setChainId] = useState<string | undefined>();
  const [providerManifest, setProviderManifest] = useState<ProviderManifest>();

  const [manifestIconUnavailable, setManifestIconUnavailable] = useState<boolean>();

  const disconnect = () => void penumbraClient.disconnect().then(() => window.location.reload());

  useEffect(() => {
    void penumbraClient.manifest().then(m => setProviderManifest(m as ProviderManifest));
    void getChainId().then(setChainId);
  }, []);

  if (!providerManifest) {
    return null;
  }

  return (
    <NavigationMenu.Root className='relative max-w-96'>
      <NavigationMenu.Item className={cn(...itemStyle)}>
        <NavigationMenu.Trigger
          className={cn(
            'group',
            ...triggerStyle,
            'h-[42px] flex flex-row gap-2 place-items-center justify-evenly whitespace-nowrap',
          )}
        >
          {manifestIconUnavailable ? (
            <Link1Icon className='text-teal-500' />
          ) : (
            <img
              id='provider-icon'
              className={cn('w-[1.5em]', 'max-w-none', 'h-[1.5em]')}
              src={String(new URL(providerManifest.icons['128'], penumbraClient.origin))}
              alt={`${providerManifest.name} Icon`}
              onError={() => setManifestIconUnavailable(true)}
            />
          )}
          {chainId}
        </NavigationMenu.Trigger>
        <NavigationMenu.Content className={cn(...dropdownStyle, 'min-w-60 w-full')}>
          <ul>
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
              <NavigationMenu.Link className={cn(...linkStyle)} onSelect={disconnect}>
                <span>
                  <LinkBreak1Icon className={cn('size-[1em]', 'inline-block')} />
                  &nbsp;Disconnect
                </span>
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          </ul>
        </NavigationMenu.Content>
      </NavigationMenu.Item>
      <NavigationMenu.Viewport className={cn(...viewportStyle)} />
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
