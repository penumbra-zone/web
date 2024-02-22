import { PagePath } from '../metadata/paths.ts';
import { EduPanel } from '../shared/edu-panels/content';

export type DashboardTab = PagePath.DASHBOARD | PagePath.TRANSACTIONS | PagePath.NFTS;

interface DashboardMetadata {
  src: string;
  label: string;
  content: EduPanel;
}

export type DashboardTabMap = Record<DashboardTab, DashboardMetadata>;
