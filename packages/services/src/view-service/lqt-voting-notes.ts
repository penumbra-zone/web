import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';
import { notesForVoting } from './notes-for-voting.js';
import {
  LqtVotingNotesResponse,
  NotesForVotingRequest,
  SpendableNoteRecord,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Nullifier } from '@penumbra-zone/protobuf/penumbra/core/component/sct/v1/sct_pb';

export const lqtVotingNotes: Impl['lqtVotingNotes'] = async function* (req, ctx) {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb, querier } = await services.getWalletServices();

  // Get the starting block height for the corresponding epoch index.
  let epoch = await indexedDb.getBlockHeightByEpoch(req.epochIndex);

  // Retrieve SNRs from storage ('ASSETS' in IndexedDB) that are eligible for voting at the start height
  // of the current epoch. Alternatively, a wasm helper `get_voting_notes` can be used to perform the same function.
  const notesForVotingRequest = new NotesForVotingRequest({
    addressIndex: req.accountFilter,
    votableAtHeight: epoch?.startHeight,
  });
  const votingNotes = notesForVoting(notesForVotingRequest, ctx);

  const spendableNoteRecords: SpendableNoteRecord[] = [];

  // Iterate through each voting note and check if it has already been used for voting
  // by performing a nullifier point query against the rpc provided by the funding service.
  for await (const votingNote of votingNotes) {
    if (votingNote.noteRecord) {
      const lqtCheckNullifierResponse = await querier.funding.lqtCheckNullifier(
        epoch?.index!,
        votingNote.noteRecord.nullifier as Nullifier,
      );
      if (lqtCheckNullifierResponse.alreadyVoted == false) {
        spendableNoteRecords.push(votingNote.noteRecord as SpendableNoteRecord);
      }
    }
  }

  // Yield the SNRs that haven't been used for voting yet.
  for (const record of spendableNoteRecords) {
    yield new LqtVotingNotesResponse({ noteRecord: record });
  }
};
