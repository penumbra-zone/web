import { PagePath } from '../metadata/paths.ts';
import { BoxIcon, SwapIcon } from '../../icons/index.tsx';
import { ReactElement } from 'react';
import { ArrowTopRightIcon, MixerHorizontalIcon, TextAlignLeftIcon } from '@radix-ui/react-icons';
import { DragHandleDotsIcon } from '../../icons/drag-handle-dots.tsx';

export interface HeaderLink {
  href: PagePath;
  label: string;
  active: boolean;
  subLinks?: PagePath[];
  icon: ReactElement;
}

export const headerLinks: HeaderLink[] = [
  {
    href: PagePath.DASHBOARD,
    label: 'Dashboard',
    active: true,
    subLinks: [PagePath.DASHBOARD, PagePath.TRANSACTIONS, PagePath.NFTS],
    icon: <BoxIcon />,
  },
  {
    href: PagePath.SEND,
    label: 'Send',
    active: true,
    subLinks: [PagePath.SEND, PagePath.RECEIVE, PagePath.IBC],
    icon: <ArrowTopRightIcon className='w-5 h-5 text-muted-foreground' />,
  },
  {
    href: PagePath.SWAP,
    label: 'Swap',
    active: false,
    icon: <SwapIcon />,
  },
  {
    href: PagePath.POOLS,
    label: 'Pools',
    active: false,
    icon: <DragHandleDotsIcon />,
  },
  {
    href: PagePath.GOVERNANCE,
    label: 'Governance',
    active: false,
    icon: <MixerHorizontalIcon className='w-5 h-5 text-muted-foreground' />,
  },
  {
    href: PagePath.STAKING,
    label: 'Staking',
    active: false,
    icon: <TextAlignLeftIcon className='w-5 h-5 text-muted-foreground' />,
  },
];

export const transactionLink = {
  href: PagePath.TRANSACTION_DETAILS,
  label: 'Transaction',
  subLinks: [PagePath.TRANSACTION_DETAILS],
};
