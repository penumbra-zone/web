import { EduPanel, eduPanelContent } from '../../shared/edu-panels/content';
import { DappPath } from '../../shared/header/types';
import { MetadataMap } from './types';

export const metadata: MetadataMap = {
  [DappPath.DASHBOARD]: {
    title: 'Penumbra | Assets',
    description: eduPanelContent[EduPanel.ASSETS],
  },
  [DappPath.TRANSACTIONS]: {
    title: 'Penumbra | Transactions',
    description: eduPanelContent[EduPanel.TRANSACTIONS_LIST],
  },
  [DappPath.NFTS]: {
    title: 'Penumbra | NFTs',
    description: eduPanelContent[EduPanel.TEMP_FILLER],
  },
  [DappPath.SEND]: {
    title: 'Penumbra | Send',
    description: eduPanelContent[EduPanel.SENDING_FUNDS],
  },
  [DappPath.RECEIVE]: {
    title: 'Penumbra | Receive',
    description: eduPanelContent[EduPanel.RECEIVING_FUNDS],
  },
  [DappPath.IBC]: {
    title: 'Penumbra | IBC',
    description: eduPanelContent[EduPanel.TEMP_FILLER],
  },
  [DappPath.SWAP]: {
    title: 'Penumbra | Swap',
    description: eduPanelContent[EduPanel.TEMP_FILLER],
  },
  [DappPath.POOLS]: {
    title: 'Penumbra | Pools',
    description: eduPanelContent[EduPanel.TEMP_FILLER],
  },
  [DappPath.GOVERNANCE]: {
    title: 'Penumbra | Governance',
    description: eduPanelContent[EduPanel.TEMP_FILLER],
  },
  [DappPath.STAKING]: {
    title: 'Penumbra | Staking',
    description: eduPanelContent[EduPanel.TEMP_FILLER],
  },
};
