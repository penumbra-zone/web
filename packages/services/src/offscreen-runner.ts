import { FullViewingKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import {
  Action,
  TransactionPlan,
  WitnessData,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { JsonObject } from '@bufbuild/protobuf';
import { ConnectError } from '@connectrpc/connect';
import { errorFromJson } from '@connectrpc/connect/protocol-connect';

let active = 0;

const activateOffscreen = async (url: string) => {
  const noOffscreen = chrome.runtime
    .getContexts({
      contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    })
    .then(offscreenContexts => !offscreenContexts.length);

  if (!active++ || (await noOffscreen))
    await chrome.offscreen
      .createDocument({
        url,
        reasons: [chrome.offscreen.Reason.WORKERS],
        justification: 'Manages Penumbra transaction WASM workers',
      })
      .catch((e: unknown) => {
        // the offscreen window might have been created since we checked
        // TODO: other failures?
        console.warn('Failed to create offscreen window', e);
      });
};

/**
 * Decrement and close if there is no remaining activity.
 */
const releaseOffscreen = async () => {
  if (!--active) await chrome.offscreen.closeDocument();
};

const sendOffscreenMessage = <I, O extends JsonObject>(req: I) =>
  chrome.runtime.sendMessage<I, O | { error: JsonObject }>(req).then(res => {
    if ('error' in res) throw errorFromJson(res.error, undefined, ConnectError.from(res));
    return res;
  });

/**
 * Build actions in parallel, in an offscreen window where we can run wasm.
 * @param cancel Promise that rejects if the build should be cancelled, usually auth denial.
 * @returns An independently-promised list of action build results.
 */
export const buildActionsOffscreen = (
  offscreenPath: string,
  transactionPlan: TransactionPlan,
  witness: WitnessData,
  fullViewingKey: FullViewingKey,
  cancel: PromiseLike<never>,
): Promise<Action>[] => {
  const activation = activateOffscreen(offscreenPath);

  const partialRequest = {
    transactionPlan: transactionPlan.toJson() as JsonObject,
    witness: witness.toJson() as JsonObject,
    fullViewingKey: fullViewingKey.toJson() as JsonObject,
  };

  const buildTasks = transactionPlan.actions.map(async (_, actionPlanIndex) => {
    // wait for offscreen to finish standing up
    await activation;
    return Action.fromJson(
      await sendOffscreenMessage({
        build: {
          ...partialRequest,
          actionPlanIndex,
        },
      }),
    );
  });

  void Promise.race([Promise.all(buildTasks), cancel])
    // suppress 'unhandled promise' logs - real failures are already conveyed by the individual promises.
    .catch()
    // this build is done with offscreen. it may shut down
    .finally(() => void releaseOffscreen());

  return buildTasks;
};
