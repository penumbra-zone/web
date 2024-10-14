import { cn } from '@penumbra-zone/ui/lib/utils';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { getChainId } from '../../../fetchers/chain-id';
import { useEffect, useState } from 'react';
import { itemStyle, triggerStyle, dropdownStyle, linkStyle, viewportStyle } from './nav-style';
import { LinkBreak1Icon } from '@radix-ui/react-icons';
import { penumbra } from '../../../penumbra';

export const ProviderMenu = () => {
  const [chainId, setChainId] = useState<string | undefined>();

  const disconnect = () => void penumbra.disconnect().then(() => window.location.reload());

  useEffect(() => {
    void getChainId().then(setChainId);
  }, []);

  if (!penumbra.manifest) {
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
          <img
            id='provider-icon'
            className={cn('w-[1.5em]', 'max-w-none', 'h-[1.5em]')}
            src={URL.createObjectURL(penumbra.manifest.icons['128'])}
            alt={`${penumbra.manifest.name} Icon`}
          />
          {chainId}
        </NavigationMenu.Trigger>
        <NavigationMenu.Content className={cn(...dropdownStyle, 'min-w-60 w-full')}>
          <ul>
            <NavigationMenu.Item className={cn(...itemStyle)}>
              <NavigationMenu.Link className={cn(...linkStyle, 'p-0', 'leading-normal')}>
                <div className='ml-4 text-muted-foreground'>
                  <span className='font-headline text-muted'>
                    {penumbra.manifest.name} {penumbra.manifest.version}
                  </span>
                  <p>{penumbra.manifest.description}</p>
                </div>
              </NavigationMenu.Link>
            </NavigationMenu.Item>
            <NavigationMenu.Item className={cn(...itemStyle)}>
              <NavigationMenu.Link className={cn(...linkStyle)} onSelect={() => disconnect()}>
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
