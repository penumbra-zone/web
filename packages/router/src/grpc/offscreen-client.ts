import {
  WitnessData,
  Action,
  TransactionPlan,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { InternalRequest, InternalResponse } from '@penumbra-zone/types/src/internal-msg/shared';
import {
  ActionBuildMessage,
  ActionBuildRequest,
  OffscreenMessage,
} from '@penumbra-zone/types/src/internal-msg/offscreen';

const OFFSCREEN_DOCUMENT_PATH = '/offscreen.html';

interface ContextsRequest {
  contextTypes: string[];
  documentUrls: string[];
}

let active = 0;

const activateOffscreen = async () => {
  const getContexts = chrome.runtime.getContexts as (
    request: ContextsRequest,
  ) => Promise<unknown[]>;

  const offscreenExists = await getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [OFFSCREEN_DOCUMENT_PATH],
  }).then(contexts => contexts.length > 0);

  if (!active || !offscreenExists) {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: [chrome.offscreen.Reason.WORKERS],
      justification: 'Manages Penumbra transaction WASM workers',
    });
  }

  active++;
};

const releaseOffscreen = async () => {
  active--;
  if (!active) await chrome.offscreen.closeDocument();
};

const sendOffscreenMessage = async <T extends OffscreenMessage>(
  req: InternalRequest<T>,
): Promise<InternalResponse<ActionBuildMessage>> => {
  try {
    // Activate the offscreen window by checking if the window already exists,
    // and if doesn't exist or there aren't any active requests, create it.
    await activateOffscreen();
    return await chrome.runtime.sendMessage<InternalRequest<T>, InternalResponse<T>>(req);
  } finally {
    // Release the offscreen window resources by closing the offscreen window
    // after the message is sent, only if there are no active requests.
    await releaseOffscreen();
  }
};

const buildAction = async (
  transactionPlan: TransactionPlan,
  witness: WitnessData,
  fullViewingKey: string,
): Promise<Action[]> => {
  const buildRes = await sendOffscreenMessage<ActionBuildMessage>({
    type: 'BUILD_ACTION',
    request: {
      transactionPlan: transactionPlan.toJson() as ActionBuildRequest['transactionPlan'],
      witness: witness.toJson() as ActionBuildRequest['witness'],
      fullViewingKey,
    },
  });
  if ('error' in buildRes) throw new Error(String(buildRes.error));

  return buildRes.data.map(a => Action.fromJson(a));
};

export const offscreenClient = { buildAction };
