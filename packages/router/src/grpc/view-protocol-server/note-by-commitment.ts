import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

import { SpendableNoteRecord } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

import { Code, ConnectError } from '@connectrpc/connect';

export const noteByCommitment: Impl['noteByCommitment'] = async (req, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const { indexedDb } = await services.getWalletServices();
  if (!req.noteCommitment)
    throw new ConnectError('Missing note commitment in request', Code.InvalidArgument);

  const noteByCommitment = await indexedDb.getSpendableNoteByCommitment(req.noteCommitment);
  if (noteByCommitment) return { spendableNote: noteByCommitment };

  // Wait until our DB encounters a new note with this commitment
  if (req.awaitDetection) {
    for await (const update of indexedDb.subscribe('SPENDABLE_NOTES')) {
      const spendableNote = SpendableNoteRecord.fromJson(update.value);
      if (spendableNote.noteCommitment?.equals(req.noteCommitment)) return { spendableNote };
    }
  }
  throw new ConnectError('Note not found', Code.NotFound);
};
