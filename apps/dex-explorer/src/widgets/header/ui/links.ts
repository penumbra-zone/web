import Link from 'next/link';
import { MoonStar, ArrowUpFromDot, Coins } from 'lucide-react';
import { PagePath } from '@/shared/const/pages';

export const HEADER_LINKS = [
  {
    as: Link,
    tabProps: { href: PagePath.Explore },
    label: 'Explore',
    value: PagePath.Explore,
    icon: Coins,
  },
  {
    as: Link,
    tabProps: { href: PagePath.Portfolio },
    label: 'Portfolio',
    value: PagePath.Portfolio,
    icon: Coins,
  },
  {
    as: Link,
    tabProps: { href: PagePath.Trade },
    label: 'Trade',
    value: PagePath.Trade,
    icon: ArrowUpFromDot,
  },
  {
    as: Link,
    tabProps: { href: PagePath.Inspect },
    label: 'Inspect',
    value: PagePath.Inspect,
    icon: MoonStar,
  },
  // TODO: Uncomment when the Tournament page is ready
  // {
  //   as: Link,
  //   tabProps: { href: PagePath.Tournament },
  //   label: 'Tournament',
  //   value: PagePath.Tournament,
  //   icon: Star,
  // },
];
