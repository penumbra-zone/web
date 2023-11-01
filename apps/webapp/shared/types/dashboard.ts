import { EduPanel } from '../edu-panels/content';

export enum DashboardPageTab {
  ASSETS = 'assets',
  TRANSACTIONS = 'transactions',
  NFTS = 'nfts',
}

export type DashboardTabMap = Record<
  DashboardPageTab,
  {
    src: string;
    label: string;
    content: EduPanel;
  }
>;
