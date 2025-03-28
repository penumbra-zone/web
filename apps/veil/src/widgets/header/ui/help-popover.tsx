import NextLink from 'next/link';
import { CircleHelp, MessageCircleHeart, BookOpenText, Info } from 'lucide-react';
import { Popover } from '@penumbra-zone/ui/Popover';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { Icon } from '@penumbra-zone/ui/Icon';
import { observer } from 'mobx-react-lite';

export const HelpPopover = observer(() => {
  return (
    <Popover>
      <Popover.Trigger>
        <Button icon={CircleHelp} iconOnly>
          Help
        </Button>
      </Popover.Trigger>
      <Popover.Content align='end' side='bottom'>
        <NextLink
          href='/portfolio?showOnboarding=true'
          className='flex px-3 py-2 gap-3 text-text-primary'
        >
          <Icon IconComponent={CircleHelp} size='md' />
          <Text small align='left'>
            Show getting started guide
          </Text>
        </NextLink>
        <a
          href='https://guide.penumbra.zone/dex'
          target='_blank'
          rel='noopener noreferrer'
          className='flex px-3 py-2 gap-3 text-text-primary'
        >
          <Icon IconComponent={BookOpenText} size='md' />
          <Text small align='left'>
            How Veil works
          </Text>
        </a>
        <a
          href='https://discord.gg/4dYRd2vgkF'
          target='_blank'
          rel='noopener noreferrer'
          className='flex px-3 py-2 gap-3 text-text-primary'
        >
          <Icon IconComponent={MessageCircleHeart} size='md' />
          <Text small align='left'>
            Provide feedback
          </Text>
        </a>
        <a
          href='https://penumbra.zone/'
          target='_blank'
          rel='noopener noreferrer'
          className='flex px-3 py-2 gap-3 text-text-primary'
        >
          <Icon IconComponent={Info} size='md' />
          <Text small align='left'>
            About Penumbra
          </Text>
        </a>
      </Popover.Content>
    </Popover>
  );
});
