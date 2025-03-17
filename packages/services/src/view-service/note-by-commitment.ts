import type { Impl } from './index.js';
import { equals, fromJson } from '@bufbuild/protobuf';
import { servicesCtx } from '../ctx/prax.js';

import { SpendableNoteRecordSchema } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

import { Code, ConnectError } from '@connectrpc/connect';
import { StateCommitmentSchema } from '@penumbra-zone/protobuf/penumbra/crypto/tct/v1/tct_pb';

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
      const spendableNote = fromJson(SpendableNoteRecordSchema, update.value);
      if (
        spendableNote.noteCommitment &&
        equals(StateCommitmentSchema, spendableNote.noteCommitment, req.noteCommitment)
      ) {
        return { spendableNote };
      }
    }
  }
  throw new ConnectError('Note not found', Code.NotFound);
};
