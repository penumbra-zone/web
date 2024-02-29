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

let active = 0;

const activateOffscreen = async () => {
  const noOffscreen = chrome.runtime
    .getContexts({
      contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    })
    .then(offscreenContexts => !offscreenContexts.length);

  if (!active++ || (await noOffscreen)) {
    await chrome.offscreen
      .createDocument({
        url: chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH),
        reasons: [chrome.offscreen.Reason.WORKERS],
        justification: 'Manages Penumbra transaction WASM workers',
      })
      .catch((e: unknown) => {
        // the offscreen window might have been created since we checked
        // TODO: other failures?
        console.warn('Failed to create offscreen window', e);
      });
  }
};

/**
 * Decrement and close if there is no remaining activity.
 */
const releaseOffscreen = async () => {
  if (!--active) await chrome.offscreen.closeDocument();
};

const sendOffscreenMessage = async <T extends OffscreenMessage>(
  req: InternalRequest<T>,
): Promise<InternalResponse<ActionBuildMessage>> =>
  chrome.runtime.sendMessage<InternalRequest<T>, InternalResponse<T>>(req);

/**
 * Build actions in parallel, in an offscreen window where we can run wasm.
 * @param cancel Promise that rejects if the build should be cancelled, usually auth denial.
 * @returns An independently-promised list of action build results.
 */
const buildActions = (
  transactionPlan: TransactionPlan,
  witness: WitnessData,
  fullViewingKey: string,
  cancel: PromiseLike<never>,
): Promise<Action>[] => {
  const active = activateOffscreen();
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  const buildTasks = transactionPlan.actions.map(async (_, actionPlanIndex) => {
    await active;
    const buildRes = await Promise.race([
      cancel,
      sendOffscreenMessage<ActionBuildMessage>({
        type: 'BUILD_ACTION',
        request: {
          transactionPlan: transactionPlan.toJson(),
          witness: witness.toJson(),
          fullViewingKey,
          actionPlanIndex,
        } as ActionBuildRequest,
      }),
    ]);
    if ('error' in buildRes) throw new Error(String(buildRes.error));
    return Action.fromJson(buildRes.data);
  });
  void Promise.all(buildTasks).finally(() => void releaseOffscreen());
  return buildTasks;
};

export const offscreenClient = { buildActions };
