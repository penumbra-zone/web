import { NoteSource } from 'penumbra-types';
import { TendermintQuerier } from '../queriers/tendermint';
import { decodeTx } from 'penumbra-wasm-ts/src/transaction';

export class Transactions {
  private readonly all = new Set<NoteSource>();

  constructor(
    // private indexedDb: IndexedDbInterface,
    private blockHeight: bigint,
    private tendermint: TendermintQuerier,
  ) {}

  add(source: NoteSource) {
    // filter out those already there
    // this.indexedDb.getAllNotes(source)
    this.all.add(source);
  }

  // TODO: Comment about querying block
  // We query block and not tx directly...
  async storeTransactionInfo() {
    if (this.all.size <= 0) return;

    // TODO: Currently bug with blockHeight 1. But what to do about block 0?
    if (this.blockHeight === 0n || this.blockHeight === 1n) return;

    const b = await this.tendermint.getBlock(this.blockHeight);
    for (const txBytes of b.block.data.txs) {
      const tx = decodeTx(txBytes);
      console.log(tx);
    }
  }
}
