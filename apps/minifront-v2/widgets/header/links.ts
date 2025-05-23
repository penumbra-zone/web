import { ArrowLeftRight, ArrowUpFromDot, Coins, MoonStar, Shield } from 'lucide-react';
import { getV2Link } from '../../../minifront/src/components/v2/get-v2-link.ts';
import { PagePath } from '../../../minifront/src/components/metadata/paths.ts';

export const HEADER_LINKS = [
  { label: 'Portfolio', value: getV2Link(PagePath.DASHBOARD), icon: Coins },
  { label: 'Shielding', value: getV2Link(PagePath.DEPOSIT_SKIP), icon: Shield },
  { label: 'Transfer', value: getV2Link(PagePath.SEND), icon: ArrowUpFromDot },
  { label: 'Swap', value: getV2Link(PagePath.SWAP), icon: ArrowLeftRight },
  { label: 'Stake', value: getV2Link(PagePath.STAKING), icon: MoonStar },
];
