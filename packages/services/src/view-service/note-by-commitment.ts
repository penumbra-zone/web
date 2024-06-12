import type { Impl } from '.';

import { Code, ConnectError } from '@connectrpc/connect';
import { dbCtx } from '../ctx/database';

export const noteByCommitment: Impl['noteByCommitment'] = async (req, ctx) => {
  const indexedDb = await ctx.values.get(dbCtx)();
  if (!req.noteCommitment)
    throw new ConnectError('Missing note commitment in request', Code.InvalidArgument);

  const subscription = indexedDb.subscribeSpendableNoteRecords();
  const noteByCommitment = await indexedDb.getSpendableNoteByCommitment(req.noteCommitment);
  if (noteByCommitment) return { spendableNote: noteByCommitment };

  // Wait until our DB encounters a new note with this commitment
  if (req.awaitDetection) {
    for await (const spendableNote of subscription) {
      if (spendableNote.noteCommitment?.equals(req.noteCommitment)) return { spendableNote };
    }
  }
  throw new ConnectError('Note not found', Code.NotFound);
};
