import {
  NoteByCommitmentRequest,
  NoteByCommitmentResponse,
  SpendableNoteRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewReqMessage } from './router';
import { ServicesInterface } from '@penumbra-zone/types';

export const isNoteByCommitmentRequest = (req: ViewReqMessage): req is NoteByCommitmentRequest => {
  return req.getType().typeName === NoteByCommitmentRequest.typeName;
};

export const handleNoteByCommitmentReq = async (
  req: NoteByCommitmentRequest,
  services: ServicesInterface,
): Promise<NoteByCommitmentResponse> => {
  const { indexedDb } = await services.getWalletServices();
  if (!req.noteCommitment) throw new Error('Missing note commitment in request');

  const noteByCommitment = await indexedDb.getNoteByCommitment(req.noteCommitment);
  if (noteByCommitment) return new NoteByCommitmentResponse({ spendableNote: noteByCommitment });
  if (!req.awaitDetection) throw new Error('Note not found');

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
