import { PagePath } from '../metadata/paths';
import { SwapIcon } from '../../icons/swap';
import { ReactElement } from 'react';
import { ArrowTopRightIcon, MixerHorizontalIcon, TextAlignLeftIcon } from '@radix-ui/react-icons';

export interface HeaderLink {
  href: PagePath;
  label: string;
  active: boolean;
  subLinks?: PagePath[];
  mobileIcon: ReactElement;
}

export const headerLinks: HeaderLink[] = [
  {
    href: PagePath.IBC,
    label: 'Shield Funds',
    active: true,
    mobileIcon: <MixerHorizontalIcon className='size-5 text-muted-foreground' />,
  },
  {
    href: PagePath.SEND,
    label: 'Send',
    active: true,
    subLinks: [PagePath.RECEIVE],
    mobileIcon: <ArrowTopRightIcon className='size-5 text-muted-foreground' />,
  },
  {
    href: PagePath.SWAP,
    label: 'Swap',
    active: true,
    subLinks: [PagePath.SWAP_AUCTION],
    mobileIcon: <SwapIcon />,
  },
  {
    href: PagePath.STAKING,
    label: 'Stake',
    active: true,
    mobileIcon: <TextAlignLeftIcon className='size-5 text-muted-foreground' />,
  },
];

export const transactionLink = {
  href: PagePath.TRANSACTION_DETAILS,
  label: 'Transaction',
  subLinks: [PagePath.TRANSACTION_DETAILS],
};
