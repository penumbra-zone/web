import { EduPanel } from '../../shared/edu-panels/content';
import { DappPath } from '../../shared/header/types';

export type SendTab = DappPath.SEND | DappPath.RECEIVE | DappPath.IBC;

export type SendTabMap = Record<
  SendTab,
  {
    src: string;
    label: string;
    content: EduPanel;
  }
>;
