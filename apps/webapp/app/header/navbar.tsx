'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DappPath } from './paths';
import { cn } from 'ui/lib/utils';

const links = [
  {
    href: DappPath.INDEX,
    label: 'Dashboard',
  },
  {
    href: DappPath.SWAP,
    label: 'Swap',
  },
  {
    href: DappPath.SEND,
    label: 'Send',
  },
  {
    href: DappPath.POOLS,
    label: 'Pools',
  },
  {
    href: DappPath.GOVERNANCE,
    label: 'Governance',
  },
  {
    href: DappPath.STAKING,
    label: 'Staking',
  },
];
export const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className='flex gap-4'>
      {links.map(i => (
        <Link
          key={i.href}
          href={i.href}
          className={cn(
            'font-bold py-[10px] px-[30px]',
            (pathname as DappPath) === i.href && 'bg-button-gradient-secondary rounded-lg',
          )}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
};
