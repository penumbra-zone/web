import NextLink from 'next/link';
import {
  CircleHelp,
  MessageCircleHeart,
  BookOpenText,
  Info,
  Shield,
  LucideIcon,
} from 'lucide-react';
import { Popover } from '@penumbra-zone/ui/Popover';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { Icon } from '@penumbra-zone/ui/Icon';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { getPortfolioPath } from '@/shared/const/pages';

const HelpPopoverItem = ({
  href,
  IconComponent,
  children,
}: {
  href: string;
  IconComponent: LucideIcon;
  children: React.ReactNode;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const Link = href.startsWith('http') ? 'a' : NextLink;

  return (
    <Link
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      className='flex gap-3 px-3 py-2 text-text-primary'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Icon IconComponent={IconComponent} size='sm' color='text.secondary' />
      <Text small align='left' color={isHovered ? 'text.primary' : 'text.secondary'}>
        {children}
      </Text>
    </Link>
  );
};

export const HelpPopover = observer(() => {
  return (
    <Popover>
      <Popover.Trigger>
        <Button icon={CircleHelp} iconOnly>
          Help
        </Button>
      </Popover.Trigger>
      <Popover.Content align='end' side='bottom'>
        <HelpPopoverItem href='https://guide.penumbra.zone/dex' IconComponent={BookOpenText}>
          How Veil works
        </HelpPopoverItem>
        <HelpPopoverItem href='https://discord.gg/4dYRd2vgkF' IconComponent={MessageCircleHeart}>
          Provide feedback
        </HelpPopoverItem>
        <HelpPopoverItem href='https://penumbra.zone/' IconComponent={Info}>
          About Penumbra
        </HelpPopoverItem>
        <HelpPopoverItem
          href={getPortfolioPath({ showShieldingTicker: true })}
          IconComponent={Shield}
        >
          Show Shielding Activity
        </HelpPopoverItem>
      </Popover.Content>
    </Popover>
  );
});
