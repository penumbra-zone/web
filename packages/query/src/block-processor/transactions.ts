import { IndexedDbInterface, noteSourceFromBytes, ParsedNoteSource } from '@penumbra-zone/types';
import { TendermintQuerier } from '../queriers/tendermint';
import { decodeTx, transactionInfo } from '@penumbra-zone/wasm-ts/src/transaction';
import { sha256Hash } from '@penumbra-zone/crypto-web';
import { NoteSource } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/chain/v1alpha1/chain_pb';
import { TransactionInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { Id } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

export class Transactions {
  // These are base64 encoded hex strings
  private readonly all = new Set<NoteSource>();

  constructor(
    private blockHeight: bigint,
    private fullViewingKey: string,
    private indexedDb: IndexedDbInterface,
    private tendermint: TendermintQuerier,
  ) {}

  async add(source?: NoteSource) {
    if (!source) return;

    // If source is not a transaction or it's already in the db, can skip
    const noteSource = noteSourceFromBytes(source);
    if (noteSource !== ParsedNoteSource.Transaction) return;
    if (await this.indexedDb.getTransaction(source)) return;

    this.all.add(source);
  }

  // Even though we already know the transaction id, we are not directly querying the node
  // for more information on that specific transaction. Doing so would leak to the node that
  // it belongs to the user. For that reason, we query the entire block, go through each
  // transaction, and filter to the transaction(s) that belong to the user.
  // We then decode and acquire more info on that transaction to store in the database.
  async storeTransactionInfo(): Promise<Set<TransactionInfo>> {
    const newTransactions = new Set<TransactionInfo>();

    if (this.all.size <= 0) return newTransactions;

    // TODO: Currently bug querying blockHeight 1
    // Tendermint does not allow querying blockHeight 0
    if (this.blockHeight === 0n || this.blockHeight === 1n) return newTransactions;

    const b = await this.tendermint.getBlock(this.blockHeight);
    if (!b.block?.data?.txs) throw new Error('Unable to query transactions');

    for (const txBytes of b.block.data.txs) {
      const hash = await sha256Hash(txBytes);
      const noteSource = new NoteSource({ inner: hash });

      if (noteSourcePresent(this.all, noteSource)) {
        const transaction = decodeTx(txBytes);
        const { txp, txv } = await transactionInfo(
          this.fullViewingKey,
          transaction,
          this.indexedDb.constants(),
        );

        const txToStore = new TransactionInfo({
          height: this.blockHeight,
          id: new Id({ hash: noteSource.inner }),
          transaction,
          perspective: txp,
          view: txv,
        });

        await this.indexedDb.saveTransactionInfo(txToStore);
        newTransactions.add(txToStore);
      }
    }
    return newTransactions;
  }
}

const noteSourcePresent = (set: Set<NoteSource>, toCheck: NoteSource) => {
  return Array.from(set).some(ns => ns.equals(toCheck));
};
