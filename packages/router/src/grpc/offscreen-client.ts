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

let active = 0;

const activateOffscreen = async () => {
  // @ts-expect-error: no types available yet
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const getContexts = chrome.runtime.getContexts as (x: unknown) => Promise<unknown[]>;
  const offscreenExists = getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [OFFSCREEN_DOCUMENT_PATH],
  }).then(contexts => contexts.length > 0);

  if (active && (await offscreenExists)) active++;
  else {
    active++;
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: [chrome.offscreen.Reason.WORKERS],
      justification: 'Manages Penumbra transaction WASM workers',
    });
  }
};

const releaseOffscreen = () => {
  active--;
  if (!active) void chrome.offscreen.closeDocument();
};

const sendOffscreenMessage = async <T extends OffscreenMessage>(
  req: InternalRequest<T>,
): Promise<InternalResponse<ActionBuildMessage>> => {
  try {
    await activateOffscreen();
    return await chrome.runtime.sendMessage<InternalRequest<T>, InternalResponse<T>>(req);
  } finally {
    releaseOffscreen();
  }
};

const buildAction = async (
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
};

export const offscreenClient = { buildAction };
