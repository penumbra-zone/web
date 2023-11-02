import { EduPanel } from '../../shared/edu-panels/content';
import { DappPath } from '../../shared/header/types';

export type DashboardTab = DappPath.DASHBOARD | DappPath.TRANSACTIONS | DappPath.NFTS;

export type DashboardTabMap = Record<
  DashboardTab,
  {
    src: string;
    label: string;
    content: EduPanel;
  }
>;

export type DashboardMetadataMap = Record<
  DashboardTab,
  {
    title: string;
    descriptions: EduPanel.ASSETS | EduPanel.TRANSACTIONS_LIST | EduPanel.TEMP_FILLER;
  }
>;
