import {
  TransactionPlannerRequest,
  TransactionPlannerResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewReqMessage } from './helpers/generic';
import { services } from '../../../service-worker';

export const isTxPlannerRequest = (msg: ViewReqMessage): msg is TransactionPlannerRequest => {
  return msg.getType().typeName === TransactionPlannerRequest.typeName;
};

export const handleTxPlannerReq = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: TransactionPlannerRequest,
): Promise<TransactionPlannerResponse> => {
  const { indexedDb } = await services.getWalletServices();
  // @ts-expect-error adfasdf
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const allNotes = await indexedDb.getAllNotes();
  // const plan = new TransactionPlan();

  return new TransactionPlannerResponse();

  // if (request.outputs.length) {
  //   let notes = await this.indexedDb.getAllValue(SPENDABLE_NOTES_TABLE_NAME);
  //
  //   notes = notes
  //     .filter(note => note.heightSpent === undefined)
  //     .filter(
  //       note =>
  //         note.note.value.assetId.inner === bytesToBase64(request.outputs[0].value.assetId.inner),
  //     );
  //   if (!notes.length) console.error('No notes found to spend');
  //
  //   const fmdParameters = await this.indexedDb.getValue(FMD_PARAMETERS_TABLE_NAME, `fmd`);
  //   if (!fmdParameters) console.error('No found FmdParameters');
  //
  //   const chainParamsRecords = await this.indexedDb.getAllValue(CHAIN_PARAMETERS_TABLE_NAME);
  //   const chainParameters = await chainParamsRecords[0];
  //   if (!fmdParameters) console.error('No found chain parameters');
  //
  //   const viewServiceData = {
  //     notes,
  //     chain_parameters: chainParameters,
  //     fmd_parameters: fmdParameters,
  //   };
  //
  //   transactionPlan = await penumbraWasm.send_plan(
  //     this.getAccountFullViewingKey(),
  //     request.outputs[0].value.toJson(),
  //     request.outputs[0].address.altBech32m,
  //     viewServiceData,
  //   );
  // }
};
