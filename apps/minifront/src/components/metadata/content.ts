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
    title: 'Penumbra | Assets',
    description: eduPanelContent[EduPanel.ASSETS],
  },
  [PagePath.TRANSACTIONS]: {
    title: 'Penumbra | Transactions',
    description: eduPanelContent[EduPanel.TRANSACTIONS_LIST],
  },
  [PagePath.NFTS]: {
    title: 'Penumbra | NFTs',
    description: eduPanelContent[EduPanel.TEMP_FILLER],
  },
  [PagePath.SEND]: {
    title: 'Penumbra | Send',
    description: eduPanelContent[EduPanel.SENDING_FUNDS],
  },
  [PagePath.RECEIVE]: {
    title: 'Penumbra | Receive',
    description: eduPanelContent[EduPanel.RECEIVING_FUNDS],
  },
  [PagePath.IBC]: {
    title: 'Penumbra | IBC',
    description: eduPanelContent[EduPanel.TEMP_FILLER],
  },
  [PagePath.SWAP]: {
    title: 'Penumbra | Swap',
    description: eduPanelContent[EduPanel.SWAP],
  },
  [PagePath.STAKING]: {
    title: 'Penumbra | Staking',
    description: eduPanelContent[EduPanel.STAKING],
  },
  [PagePath.TRANSACTION_DETAILS]: {
    title: 'Penumbra | Transaction',
    description: 'More details about transaction',
  },
};
