// import { InternalRequest, InternalResponse } from '@penumbra-zone/types/src/internal-msg/shared';
// import { WitnessAndBuildRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
// import { TransactionPlan, WitnessData } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
// import { ActionBuildMessage, OffscreenMessage, OffscreenRequest } from '.../';
// import { Jsonified } from '@penumbra-zone/types';

// const OFFSCREEN_DOCUMENT_PATH = '/offscreen.html';

// const sw = self as unknown as ServiceWorkerGlobalScope;

// const request: OffscreenRequest['type'][] = ['BUILD_ACTION'];

// export const offscreenClient = {
//   buildAction: (
//     arg: WitnessAndBuildRequest,
//     witness: WitnessData,
//     fullViewingKey: string,
//     length: number,
//   ): Promise<InternalResponse<ActionBuildMessage>> =>
//     sendOffscreenMessage<ActionBuildMessage>({
//       type: 'BUILD_ACTION',
//       request: {
//         transactionPlan: arg.transactionPlan!.toJson(),
//         witness: witness.toJson(),
//         fullViewingKey,
//         length,
//       },
//     }),
// };

// export const sendOffscreenMessage = async <T extends OffscreenMessage>(
//   req: InternalRequest<T>,
// ) => {
//   console.log("Entered sendOffscreenMessage!")
//   try {
//     if (!(await hasDocument())) {
//       await chrome.offscreen.createDocument({
//         url: OFFSCREEN_DOCUMENT_PATH,
//         reasons: [chrome.offscreen.Reason.WORKERS],
//         justification: 'spawn web workers from offscreen document',
//       });
//     }

//     // console.log("req tx json is: ", req.request.transactionPlan)
//     // console.log("req tx from json is: ", TransactionPlan.fromJson(req.request.transactionPlan))

//     console.log("req before: ", req.request.transactionPlan)
//     console.log("TransactionPlan.fromJson({}) before: ", TransactionPlan.fromJson({}))

//     await new Promise((resolve) => setTimeout(resolve, 1000))

//     // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
//     const result = (await chrome.runtime.sendMessage(req));

//     if ('error' in result) throw new Error('failed to build action');

//     // Close offscreen document
//     // await chrome.offscreen.closeDocument();

//     return result;
//   } catch (e) {
//     return { type: req.type, error: e };
//   }
// };

// export const isOffscreenRequest = (req: unknown): req is OffscreenRequest => {
//   return (
//     req != null &&
//     typeof req === 'object' &&
//     'type' in req &&
//     typeof req.type === 'string' &&
//     request.includes(req.type as OffscreenRequest['type'])
//   );
// };

// async function hasDocument() {
//   // Check all windows controlled by the service worker if one of them is the offscreen document
//   const matchedClients = await sw.clients.matchAll();
//   for (const client of matchedClients) {
//     if (client.url.endsWith(OFFSCREEN_DOCUMENT_PATH)) {
//       return true;
//     }
//   }
//   return false;
// }
