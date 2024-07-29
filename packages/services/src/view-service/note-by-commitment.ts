import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';
import { SpendableNoteRecord } from '@penumbra-zone/protobuf/types';

import { Code, ConnectError } from '@connectrpc/connect';

export const noteByCommitment: Impl['noteByCommitment'] = async (req, ctx) => {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();
  if (!req.noteCommitment) {
    throw new ConnectError('Missing note commitment in request', Code.InvalidArgument);
  }

  const noteByCommitment = await indexedDb.getSpendableNoteByCommitment(req.noteCommitment);
  if (noteByCommitment) {
    return { spendableNote: noteByCommitment };
  }

  // Wait until our DB encounters a new note with this commitment
  if (req.awaitDetection) {
    for await (const update of indexedDb.subscribe('SPENDABLE_NOTES')) {
      const spendableNote = SpendableNoteRecord.fromJson(update.value);
      if (spendableNote.noteCommitment?.equals(req.noteCommitment)) {
        return { spendableNote };
      }
    }
  }
  throw new ConnectError('Note not found', Code.NotFound);
};
