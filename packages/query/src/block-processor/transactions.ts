import { IndexedDbInterface, NoteSource } from 'penumbra-types';
import { TendermintQuerier } from '../queriers/tendermint';
import { decodeTx, transactionInfo } from 'penumbra-wasm-ts/src/transaction';
import { StoredTransaction } from 'penumbra-types/src/transaction/view';
import { sha256Hash } from 'penumbra-crypto-ts';

export class Transactions {
  private readonly all = new Set<NoteSource>();

  constructor(
    private blockHeight: bigint,
    private fullViewingKey: string,
    private indexedDb: IndexedDbInterface,
    private tendermint: TendermintQuerier,
  ) {}

  add(source: NoteSource) {
    // TODO: How do we filter out tx's?
    // filter out those already there
    this.indexedDb.getAllNotes(source);
    this.all.add(source);
  }

  // Even though we already know the transaction id, we are not directly querying the node
  // for more information on that specific transaction. Doing so would leak to the node that
  // it belongs to the user. For that reason, we query the entire block, go through each
  // transaction, and filter to the transaction(s) that belong to the user.
  // We then decode and acquire more info on that transaction to store in the database.
  async storeTransactionInfo() {
    if (this.all.size <= 0) return;

    // TODO: Currently bug with blockHeight 1. But what to do about block 0?
    if (this.blockHeight === 0n || this.blockHeight === 1n) return;

    const b = await this.tendermint.getBlock(this.blockHeight);
    for (const txBytes of b.block.data.txs) {
      const txId = await sha256Hash(txBytes);
      const tx = decodeTx(txBytes);

      if (this.all.has(txId)) {
        const txInfo = await transactionInfo(this.fullViewingKey, tx);

        const txToStore = {
          blockHeight: this.blockHeight,
          id: txId,
          tx,
          perspective: txInfo.txp,
          view: txInfo.txv,
        } satisfies StoredTransaction;

        await this.indexedDb.saveTransactionInfo(txToStore);
      }
    }
  }
}
