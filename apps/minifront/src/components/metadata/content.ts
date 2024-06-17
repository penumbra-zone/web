import { PagePath } from './paths';
import { EduPanel, eduPanelContent } from '../shared/edu-panels/content';

export interface PageMetadata {
  title: string;
  description: string;
}

export const metadata: Record<PagePath, PageMetadata> = {
  [PagePath.INDEX]: {
    title: 'Penumbra',
    description: '',
  },
  [PagePath.DASHBOARD]: {
    title: 'Assets',
    description: eduPanelContent[EduPanel.ASSETS],
  },
  [PagePath.TRANSACTIONS]: {
    title: 'Transactions',
    description: eduPanelContent[EduPanel.TRANSACTIONS_LIST],
  },
  [PagePath.NFTS]: {
    title: 'NFTs',
    description: eduPanelContent[EduPanel.TEMP_FILLER],
  },
  [PagePath.SEND]: {
    title: 'Send',
    description: eduPanelContent[EduPanel.SENDING_FUNDS],
  },
  [PagePath.RECEIVE]: {
    title: 'Receive',
    description: eduPanelContent[EduPanel.RECEIVING_FUNDS],
  },
  [PagePath.IBC]: {
    title: 'Shield Funds',
    description: eduPanelContent[EduPanel.TEMP_FILLER],
  },
  [PagePath.SWAP]: {
    title: 'Swap',
    description: eduPanelContent[EduPanel.SWAP],
  },
  [PagePath.STAKING]: {
    title: 'Staking',
    description: eduPanelContent[EduPanel.STAKING],
  },
  [PagePath.TRANSACTION_DETAILS]: {
    title: 'Transaction',
    description: 'More details about transaction',
  },
};
