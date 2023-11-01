import { EduPanel } from '../../shared/edu-panels/content';

export enum DashboardPageTab {
  DASHBOARD = '/dashboard',
  TRANSACTIONS = '/dashboard/transactions',
  NFTS = '/dashboard/nfts',
}

export type DashboardTabMap = Record<
  DashboardPageTab,
  {
    src: string;
    label: string;
    content: EduPanel;
  }
>;
