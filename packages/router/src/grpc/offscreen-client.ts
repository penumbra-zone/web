import { WitnessAndBuildRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { WitnessData } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { InternalRequest, InternalResponse } from '@penumbra-zone/types/src/internal-msg/shared';
import {
  ActionBuildMessage,
  OffscreenMessage,
} from '@penumbra-zone/types/src/internal-msg/offscreen-types';

const OFFSCREEN_DOCUMENT_PATH = '/offscreen.html';

export const offscreenClient = {
  buildAction: (
    arg: WitnessAndBuildRequest,
    witness: WitnessData,
    fullViewingKey: string,
  ): Promise<InternalResponse<ActionBuildMessage>> =>
    sendOffscreenMessage<ActionBuildMessage>({
      type: 'BUILD_ACTION',
      request: {
        transactionPlan: arg.transactionPlan!.toJson(),
        witness: witness.toJson(),
        fullViewingKey,
      },
    }),
};

export const sendOffscreenMessage = async <T extends OffscreenMessage>(
  req: InternalRequest<T>,
): Promise<InternalResponse<ActionBuildMessage>> => {
  await chrome.offscreen.createDocument({
    url: OFFSCREEN_DOCUMENT_PATH,
    reasons: [chrome.offscreen.Reason.WORKERS],
    justification: 'spawn web workers from offscreen document',
  });

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const result = (await chrome.runtime.sendMessage({
    ...req,
  })) as InternalResponse<ActionBuildMessage>;
  if ('error' in result) throw new Error('failed to build action');

  // Close offscreen document
  await chrome.offscreen.closeDocument();

  return result;
};
