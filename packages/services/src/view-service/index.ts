import type { ServiceImpl } from '@connectrpc/connect';
import type { ViewService } from '@penumbra-zone/protobuf';
import { addressByIndex } from './address-by-index';
import { appParameters } from './app-parameters';
import { assetMetadataById } from './asset-metadata-by-id';
import { assets } from './assets';
import { auctions } from './auctions';
import { authorizeAndBuild } from './authorize-and-build';
import { balances } from './balances';
import { broadcastTransaction } from './broadcast-transaction';
import { delegationsByAddressIndex } from './delegations-by-address-index';
import { ephemeralAddress } from './ephemeral-address';
import { fMDParameters } from './fmd-parameters';
import { gasPrices } from './gas-prices';
import { indexByAddress } from './index-by-address';
import { noteByCommitment } from './note-by-commitment';
import { notes } from './notes';
import { notesForVoting } from './notes-for-voting';
import { nullifierStatus } from './nullifier-status';
import { ownedPositionIds } from './owned-position-ids';
import { status } from './status';
import { statusStream } from './status-stream';
import { swapByCommitment } from './swap-by-commitment';
import { transactionInfo } from './transaction-info';
import { transactionInfoByHash } from './transaction-info-by-hash';
import { transactionPlanner } from './transaction-planner';
import { unbondingTokensByAddressIndex } from './unbonding-tokens-by-address-index';
import { unclaimedSwaps } from './unclaimed-swaps';
import { walletId } from './wallet-id';
import { witness } from './witness';
import { witnessAndBuild } from './witness-and-build';

export type Impl = ServiceImpl<typeof ViewService>;

export const viewImpl: Impl = {
  addressByIndex,
  appParameters,
  assetMetadataById,
  assets,
  auctions,
  authorizeAndBuild,
  balances,
  broadcastTransaction,
  delegationsByAddressIndex,
  ephemeralAddress,
  fMDParameters,
  gasPrices,
  indexByAddress,
  noteByCommitment,
  notes,
  notesForVoting,
  nullifierStatus,
  ownedPositionIds,
  status,
  statusStream,
  swapByCommitment,
  transactionInfo,
  transactionInfoByHash,
  transactionPlanner,
  unbondingTokensByAddressIndex,
  unclaimedSwaps,
  walletId,
  witness,
  witnessAndBuild,
};
