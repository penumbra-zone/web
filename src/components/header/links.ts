import { MoonStar, ArrowUpFromDot, Coins } from 'lucide-react';
import { PagePath } from '@/utils/routes/pages.ts';

export const HEADER_LINKS = [
  { label: 'Trade', value: PagePath.Trade, icon: ArrowUpFromDot },
  { label: 'Explore', value: PagePath.Explore, icon: Coins },
  { label: 'Inspect', value: PagePath.Inspect, icon: MoonStar },
  { label: 'Portfolio', value: PagePath.Portfolio, icon: Coins },
];
