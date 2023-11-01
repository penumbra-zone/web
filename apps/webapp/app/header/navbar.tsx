'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DappPath } from './paths';
import { cn } from '@penumbra-zone/ui/lib/utils';

const links = [
  {
    href: DappPath.INDEX,
    label: 'Dashboard',
    active: true,
    subLinks: [DappPath.ASSETS, DappPath.TRANSACTIONS],
  },
  {
    href: DappPath.SEND,
    label: 'Send',
    active: true,
    subLinks: [DappPath.SEND, DappPath.RECEIVE],
  },
  {
    href: DappPath.SWAP,
    label: 'Swap',
    active: false,
    subLinks: [],
  },
  {
    href: DappPath.POOLS,
    label: 'Pools',
    active: false,
    subLinks: [],
  },
  {
    href: DappPath.GOVERNANCE,
    label: 'Governance',
    active: false,
    subLinks: [],
  },
  {
    href: DappPath.STAKING,
    label: 'Staking',
    active: false,
    subLinks: [],
  },
];

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className='flex gap-4'>
      {links.map(link =>
        link.active ? (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'font-bold py-[10px] px-[30px] select-none',
              link.subLinks.includes(pathname as DappPath) &&
                'bg-button-gradient-secondary rounded-lg',
            )}
          >
            {link.label}
          </Link>
        ) : (
          <div
            key={link.href}
            className='cursor-not-allowed select-none px-[30px] py-[10px] font-bold text-gray-600'
          >
            {link.label}
          </div>
        ),
      )}
    </nav>
  );
};
