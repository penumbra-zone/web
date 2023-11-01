import { EduPanel } from '../../shared/edu-panels/content';
import { DappPath } from '../header/paths';

export type DashboardTab = DappPath.DASHBOARD | DappPath.TRANSACTIONS | DappPath.NFTS;

export type DashboardTabMap = Record<
  DashboardTab,
  {
    src: string;
    label: string;
    content: EduPanel;
  }
>;
