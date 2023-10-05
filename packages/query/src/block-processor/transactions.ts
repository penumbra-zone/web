import { NoteSource } from 'penumbra-types';
import { TendermintQuerier } from '../queriers/tendermint';
import { decodeTx, transactionInfo } from 'penumbra-wasm-ts/src/transaction';

export class Transactions {
  private readonly all = new Set<NoteSource>();

  constructor(
    // private indexedDb: IndexedDbInterface,
    private blockHeight: bigint,
    private tendermint: TendermintQuerier,
    private fullViewingKey: string,
  ) {}

  add(source: NoteSource) {
    // filter out those already there
    // this.indexedDb.getAllNotes(source)
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
      const tx = decodeTx(txBytes);
      const txInfo = await transactionInfo(this.fullViewingKey, tx);
      console.log(txInfo);
    }
  }
}
