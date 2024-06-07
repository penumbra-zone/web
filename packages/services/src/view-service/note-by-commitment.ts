import { SpendableNoteRecord } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Code, ConnectError } from '@connectrpc/connect';
import type { Impl } from '.';
import { idbCtx } from '../ctx/prax';

export const noteByCommitment: Impl['noteByCommitment'] = async (req, ctx) => {
  const idb = await ctx.values.get(idbCtx)();
  if (!req.noteCommitment)
    throw new ConnectError('Missing note commitment in request', Code.InvalidArgument);

  const noteByCommitment = await idb.getSpendableNoteByCommitment(req.noteCommitment);
  if (noteByCommitment) return { spendableNote: noteByCommitment };

  // Wait until our DB encounters a new note with this commitment
  if (req.awaitDetection) {
    for await (const update of idb.subscribe('SPENDABLE_NOTES')) {
      const spendableNote = SpendableNoteRecord.fromJson(update.value);
      if (spendableNote.noteCommitment?.equals(req.noteCommitment)) return { spendableNote };
    }
  }
  throw new ConnectError('Note not found', Code.NotFound);
};
