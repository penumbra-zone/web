import NextLink from 'next/link';
import { CircleHelp } from 'lucide-react';
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
        <NextLink href='/portfolio?showOnboarding=true'>
          <button className='flex px-3 py-2 gap-3 text-text-primary'>
            <Icon IconComponent={CircleHelp} size='md' />
            <Text small align='left'>
              Show getting started guide
            </Text>
          </button>
        </NextLink>
      </Popover.Content>
    </Popover>
  );
});
