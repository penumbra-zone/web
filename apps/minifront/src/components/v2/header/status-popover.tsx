import { Blocks } from 'lucide-react';
import { Popover } from '@repo/ui/Popover';
import { Button } from '@repo/ui/Button';
import { Text } from '@repo/ui/Text';

export const StatusPopover = () => {
  return (
    <Popover>
      <Popover.Trigger>
        <Button icon={Blocks} iconOnly>
          Status
        </Button>
      </Popover.Trigger>
      <Popover.Content align='end' side='bottom'>
        <Text>Prax wallet</Text>
      </Popover.Content>
    </Popover>
  );
};
