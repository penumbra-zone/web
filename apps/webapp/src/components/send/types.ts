import { PagePath } from '../metadata/paths.ts';
import { EduPanel } from '../shared/edu-panels/content';

export type SendTab = PagePath.SEND | PagePath.RECEIVE | PagePath.IBC;

interface SendTabMetadata {
  src: string;
  label: string;
  content: EduPanel;
}

export type SendTabMap = Record<SendTab, SendTabMetadata>;
