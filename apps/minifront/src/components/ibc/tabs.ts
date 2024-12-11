import { PagePath } from '../metadata/paths.ts';

export type ShieldTab = PagePath.DEPOSIT_SKIP | PagePath.DEPOSIT_MANUAL | PagePath.WITHDRAW;

export const shieldTabs = [
  { title: 'Deposit (skip)', href: PagePath.DEPOSIT_SKIP, enabled: true },
  { title: 'Deposit (manual)', href: PagePath.DEPOSIT_MANUAL, enabled: true },
  { title: 'Withdraw', href: PagePath.WITHDRAW, enabled: true },
];
