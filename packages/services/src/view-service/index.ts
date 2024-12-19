import type { ServiceImpl } from '@connectrpc/connect';
import type { ViewService } from '@penumbra-zone/protobuf';
import { addressByIndex } from './address-by-index.js';
import { appParameters } from './app-parameters.js';
import { assetMetadataById } from './asset-metadata-by-id.js';
import { assets } from './assets.js';
import { auctions } from './auctions.js';
import { authorizeAndBuild } from './authorize-and-build.js';
import { balances } from './balances.js';
import { broadcastTransaction } from './broadcast-transaction.js';
import { delegationsByAddressIndex } from './delegations-by-address-index.js';
import { ephemeralAddress } from './ephemeral-address.js';
import { fMDParameters } from './fmd-parameters.js';
import { gasPrices } from './gas-prices.js';
import { indexByAddress } from './index-by-address.js';
import { noteByCommitment } from './note-by-commitment.js';
import { notes } from './notes.js';
import { notesForVoting } from './notes-for-voting.js';
import { nullifierStatus } from './nullifier-status.js';
import { ownedPositionIds } from './owned-position-ids.js';
import { status } from './status.js';
import { statusStream } from './status-stream.js';
import { swapByCommitment } from './swap-by-commitment.js';
import { transactionInfo } from './transaction-info.js';
import { transactionInfoByHash } from './transaction-info-by-hash.js';
import { transactionPlanner } from './transaction-planner/index.js';
import { unbondingTokensByAddressIndex } from './unbonding-tokens-by-address-index/index.js';
import { unclaimedSwaps } from './unclaimed-swaps.js';
import { walletId } from './wallet-id.js';
import { witness } from './witness.js';
import { witnessAndBuild } from './witness-and-build.js';
import { transparentAddress } from './transparent-address.js';

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
  transparentAddress,
};
