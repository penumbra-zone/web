import { MoonStar, ArrowUpFromDot, Coins } from 'lucide-react';
import { PagePath } from '@/shared/const/pages';

export const HEADER_LINKS = [
  { label: 'Explore', value: PagePath.Explore, icon: Coins },
  { label: 'Portfolio', value: PagePath.Portfolio, icon: Coins },
  { label: 'Trade', value: PagePath.Trade, icon: ArrowUpFromDot },
  { label: 'Inspect', value: PagePath.Inspect, icon: MoonStar },
];
