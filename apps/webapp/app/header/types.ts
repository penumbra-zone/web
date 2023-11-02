import { DappPath } from '../../shared/header/types';

export interface HeaderLink {
  href: DappPath;
  label: string;
  active: boolean;
  subLinks?: DappPath[];
}
