import { PagePath } from '../metadata/paths';
import { BoxIcon, SwapIcon } from '../../icons/index';
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
    href: PagePath.DASHBOARD,
    label: 'Dashboard',
    active: true,
    subLinks: [PagePath.TRANSACTIONS, PagePath.NFTS],
    mobileIcon: <BoxIcon />,
  },
  {
    href: PagePath.SEND,
    label: 'Send',
    active: true,
    subLinks: [PagePath.RECEIVE, PagePath.IBC],
    mobileIcon: <ArrowTopRightIcon className='size-5 text-muted-foreground' />,
  },
  {
    href: PagePath.SWAP,
    label: 'Swap',
    active: true,
    mobileIcon: <SwapIcon />,
  },
  {
    href: PagePath.STAKING,
    label: 'Staking',
    active: true,
    mobileIcon: <TextAlignLeftIcon className='size-5 text-muted-foreground' />,
  },
  {
    href: PagePath.GOVERNANCE,
    label: 'Governance',
    active: false,
    mobileIcon: <MixerHorizontalIcon className='size-5 text-muted-foreground' />,
  },
];

export const transactionLink = {
  href: PagePath.TRANSACTION_DETAILS,
  label: 'Transaction',
  subLinks: [PagePath.TRANSACTION_DETAILS],
};
