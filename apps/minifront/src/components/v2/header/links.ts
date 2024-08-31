import { Shield, MoonStar, ArrowLeftRight, ArrowUpFromDot, Coins } from 'lucide-react';
import { getV2Link } from '../get-v2-link.ts';
import { PagePath } from '../../metadata/paths.ts';

export const HEADER_LINKS = [
  { label: 'Dashboard', value: getV2Link(PagePath.DASHBOARD), icon: Coins },
  { label: 'Shield', value: getV2Link(PagePath.IBC), icon: Shield },
  { label: 'Transfer', value: getV2Link(PagePath.SEND), icon: ArrowUpFromDot },
  { label: 'Swap', value: getV2Link(PagePath.SWAP), icon: ArrowLeftRight },
  { label: 'Stake', value: getV2Link(PagePath.STAKING), icon: MoonStar },
];
