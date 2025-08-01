import { ArrowLeftRight, ArrowUpFromDot, Coins, MoonStar, Shield } from 'lucide-react';
import { PagePath } from '@/shared/const/page';

export const HEADER_LINKS = [
  { label: 'Portfolio', value: PagePath.Portfolio, icon: Coins },
  { label: 'Shielding', value: PagePath.Shielding, icon: Shield },
  { label: 'Transfer', value: PagePath.Transfer, icon: ArrowUpFromDot },
  { label: 'Swap', value: '/swap', icon: ArrowLeftRight },
  { label: 'Stake', value: PagePath.Stake, icon: MoonStar },
];
