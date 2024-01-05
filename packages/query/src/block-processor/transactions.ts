import { IndexedDbInterface, ViewServerInterface } from '@penumbra-zone/types';
import { transactionInfo } from '@penumbra-zone/wasm-ts/src/transaction';
import { sha256Hash } from '@penumbra-zone/crypto-web';
import { TransactionInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { Transaction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import {
  PositionState,
  PositionState_PositionStateEnum,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1alpha1/dex_pb';
import { AppQuerier } from '../queriers/app';
import {
  CommitmentSource,
  CommitmentSource_Transaction,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1alpha1/sct_pb';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1alpha1/txhash_pb';

// A class that stores transaction ids which are used to later augment with transaction info to store
export class Transactions {
  private readonly all = new Set<CommitmentSource_Transaction>();

  constructor(
    private blockHeight: bigint,
    private fullViewingKey: string,
    private indexedDb: IndexedDbInterface,
    private querier: AppQuerier,
    private viewServer: ViewServerInterface,
  ) {}

  async add(cs?: CommitmentSource) {
    if (!cs) return;

    // If source is not a transaction or it's already in the db, can skip
    if (cs.source.case !== 'transaction') return;
    if (await this.indexedDb.getTransaction(cs.source.value)) return;

    this.all.add(cs.source.value);
  }

  // Even though we already know the transaction id, we are not directly querying the node
  // for more information on that specific transaction. Doing so would leak to the node that
  // it belongs to the user. For that reason, we query the entire block, go through each
  // transaction, and filter to the transaction(s) that belong to the user.
  // We then decode and acquire more info on that transaction to store in the database.
  async storeTransactionInfo() {
    if (this.all.size <= 0) return;

    const { transactions } = await this.querier.txsByHeight(this.blockHeight);

    for (const tx of transactions) {
      const hash = await sha256Hash(encodeTx(tx));
      const commitmentSource = new CommitmentSource_Transaction({ id: hash });

      if (commitmentSourcePresent(this.all, commitmentSource)) {
        // We must store LpNft metadata before calling transactionInfo() because to generate TxV and TxP
        // wasm needs LpNft metadata, which it will read from the indexed-db
        await this.storeLpNft(tx);

        const { txp, txv } = await transactionInfo(
          this.fullViewingKey,
          tx,
          this.indexedDb.constants(),
        );

        const txToStore = new TransactionInfo({
          height: this.blockHeight,
          id: new TransactionId({ inner: commitmentSource.id }),
          transaction: tx,
          perspective: txp,
          view: txv,
        });

        await this.indexedDb.saveTransactionInfo(txToStore);
      }
    }
  }

  // LpNft asset IDs won't be known to the chain, so we need to pre-populate them in local
  // registry based on transaction contents.
  // Necessary to save LpNft metadata for 'closed' 'withdrawn' and 'claimed' as soon as we detect a 'positionOpen' action
  // because only the 'positionOpen' action contains a 'Position' structure from which we can generate metadata
  async storeLpNft(tx: Transaction) {
    if (!tx.body?.actions) {
      return;
    }
    for (const a of tx.body.actions) {
      if (a.action.case !== 'positionOpen' || a.action.value.position === undefined) {
        continue;
      }

      const positionStates = [
        PositionState_PositionStateEnum.OPENED,
        PositionState_PositionStateEnum.CLOSED,
        PositionState_PositionStateEnum.WITHDRAWN,
        PositionState_PositionStateEnum.CLAIMED,
      ];

      for (const state of positionStates) {
        const positionState = new PositionState({ state });
        const metadata = this.viewServer.getLpNftMetadata(a.action.value.position, positionState);
        await this.indexedDb.saveAssetsMetadata(metadata);
      }
    }
  }
}

const commitmentSourcePresent = (
  set: Set<CommitmentSource_Transaction>,
  toCheck: CommitmentSource_Transaction,
) => {
  return Array.from(set).some(cs => cs.equals(toCheck));
};
