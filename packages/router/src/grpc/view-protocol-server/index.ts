import type { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import type { ServiceImpl } from '@connectrpc/connect';
export type Impl = ServiceImpl<typeof ViewProtocolService>;

import { addressByIndex } from './address-by-index';
import { appParameters } from './app-parameters';
import { assets } from './assets';
import { balances } from './balances';
import { broadcastTransaction } from './broadcast-transaction';
import { ephemeralAddress } from './ephemeral-address';
import { fMDParameters } from './fmd-parameters';
import { gasPrices } from './gas-prices';
import { indexByAddress } from './index-by-address';
import { noteByCommitment } from './note-by-commitment';
import { notes } from './notes';
import { nullifierStatus } from './nullifier-status';
import { status } from './status';
import { statusStream } from './status-stream';
import { swapByCommitment } from './swap-by-commitment';
import { transactionInfo } from './transaction-info';
import { transactionInfoByHash } from './transaction-info-by-hash';
import { transactionPlanner } from './transaction-planner';
import { unclaimedSwaps } from './unclaimed-swaps';
import { walletId } from './wallet-id';
import { witnessAndBuild } from './witness-and-build';
import { authorizeAndBuild } from './authorize-and-build';
import { witness } from './witness';

export const viewImpl: Omit<Impl, 'notesForVoting' | 'ownedPositionIds'> = {
  addressByIndex,
  appParameters,
  assets,
  balances,
  broadcastTransaction,
  ephemeralAddress,
  fMDParameters,
  gasPrices,
  indexByAddress,
  noteByCommitment,
  notes,
  nullifierStatus,
  status,
  statusStream,
  swapByCommitment,
  transactionInfo,
  transactionInfoByHash,
  transactionPlanner,
  unclaimedSwaps,
  walletId,
  witnessAndBuild,
  witness,
  authorizeAndBuild
};
