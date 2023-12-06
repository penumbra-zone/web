import {
  NoteByCommitmentRequest,
  NoteByCommitmentResponse,
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
  if (!req.noteCommitment) return new NoteByCommitmentResponse();

  // TODO  req.await_detection processing

  const noteByCommitment = await indexedDb.getNoteByCommitment(req.noteCommitment);
  if (!noteByCommitment) return new NoteByCommitmentResponse();

  return new NoteByCommitmentResponse({ spendableNote: noteByCommitment });
};
