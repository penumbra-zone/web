import { WitnessAndBuildRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import {
  WitnessData,
  Action,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { InternalRequest, InternalResponse } from '@penumbra-zone/types/src/internal-msg/shared';
import {
  ActionBuildMessage,
  ActionBuildRequest,
  OffscreenMessage,
} from '@penumbra-zone/types/src/internal-msg/offscreen';

const OFFSCREEN_DOCUMENT_PATH = '/offscreen.html';

export const offscreenClient = {
  buildAction: async (
    arg: WitnessAndBuildRequest,
    witness: WitnessData,
    fullViewingKey: string,
  ): Promise<Action[]> => {
    const buildRes = await sendOffscreenMessage<ActionBuildMessage>({
      type: 'BUILD_ACTION',
      request: {
        transactionPlan: arg.transactionPlan!.toJson() as ActionBuildRequest['transactionPlan'],
        witness: witness.toJson() as ActionBuildRequest['witness'],
        fullViewingKey,
      },
    });
    if ('error' in buildRes) throw new Error(String(buildRes.error));
    const actions = buildRes.data.map(a => Action.fromJson(a));
    return actions;
  },
};

export const sendOffscreenMessage = async <T extends OffscreenMessage>(
  req: InternalRequest<T>,
): Promise<InternalResponse<ActionBuildMessage>> => {
  await chrome.offscreen.createDocument({
    url: OFFSCREEN_DOCUMENT_PATH,
    reasons: [chrome.offscreen.Reason.WORKERS],
    justification: 'Manages Penumbra transaction WASM workers',
  });

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const result = (await chrome.runtime.sendMessage({
    ...req,
  })) satisfies InternalResponse<ActionBuildMessage>;

  return result;
};
