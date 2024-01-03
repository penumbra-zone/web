import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

import {
  NoteByCommitmentResponse,
  SpendableNoteRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';

import { ConnectError, Code } from '@connectrpc/connect';

export const noteByCommitment: Impl['noteByCommitment'] = async (req, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const { indexedDb } = await services.getWalletServices();
  if (!req.noteCommitment)
    throw new ConnectError('Missing note commitment in request', Code.InvalidArgument);

  const noteByCommitment = await indexedDb.getNoteByCommitment(req.noteCommitment);
  if (noteByCommitment) return { spendableNote: noteByCommitment };
  if (!req.awaitDetection) throw new ConnectError('Note not found', Code.NotFound);

  // Wait until our DB encounters a new note with this commitment
  const response = new NoteByCommitmentResponse();
  const subscription = indexedDb.subscribe('SPENDABLE_NOTES');

  for await (const update of subscription) {
    const note = SpendableNoteRecord.fromJson(update.value);
    if (note.noteCommitment?.equals(req.noteCommitment)) {
      response.spendableNote = note;
      break;
    }
  }
  return response;
};
