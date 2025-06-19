import { FullViewingKey } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import {
  Action,
  TransactionPlan,
  WitnessData,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { ConnectError } from '@connectrpc/connect';
import { errorFromJson } from '@connectrpc/connect/protocol-connect';
import { ActionBuildMessage, OffscreenMessage } from '@penumbra-zone/types/internal-msg/offscreen';
import { InternalRequest, InternalResponse } from '@penumbra-zone/types/internal-msg/shared';
import type { Jsonified } from '@penumbra-zone/types/jsonified';

const OFFSCREEN_DOCUMENT_PATH = '/offscreen.html';

let active = 0;

type BuildResultKind = 'action' | 'witness';

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
  if (!--active) {
    await chrome.offscreen.closeDocument();
  }
};

const sendOffscreenMessage = async <T extends OffscreenMessage>(req: InternalRequest<T>) =>
  chrome.runtime.sendMessage<InternalRequest<T>, InternalResponse<T>>(req).then(res => {
    if ('error' in res) {
      throw errorFromJson(res.error, undefined, ConnectError.from(res));
    }
    return res.data;
  });

/**
 * Build in parallel, in an offscreen window where we can run wasm.
 * @param cancel Promise that rejects if the build should be cancelled, usually auth denial.
 * @returns An independently-promised list of action build results.
 */
const buildOffscreen = <T>(
  transactionPlan: TransactionPlan,
  witness: WitnessData,
  fullViewingKey: FullViewingKey,
  workload: BuildResultKind,
  cancel: PromiseLike<never>,
): Promise<T>[] => {
  const activation = activateOffscreen();

  // this json serialization involves a lot of binary -> base64 which is slow,
  // so just do it once and reuse
  const partialRequest = {
    transactionPlan: transactionPlan.toJson() as Jsonified<TransactionPlan>,
    witness: witness.toJson() as Jsonified<WitnessData>,
    fullViewingKey: fullViewingKey.toJson() as Jsonified<FullViewingKey>,
    workload,
  };

  const buildTasks = transactionPlan.actions.map(async (_, actionPlanIndex) => {
    const buildReq: InternalRequest<ActionBuildMessage> = {
      type: 'BUILD_ACTION',
      request: {
        ...partialRequest,
        actionPlanIndex,
      },
    };

    // wait for offscreen to finish standing up
    await activation;

    const res = await sendOffscreenMessage(buildReq);

    return workload === 'action' ? (Action.fromJson(res) as T) : (res as unknown as T);
  });

  void Promise.race([Promise.all(buildTasks), cancel])
    // suppress 'unhandled promise' logs - real failures are already conveyed by the individual promises.
    .catch()
    // this build is done with offscreen. it may shut down
    .finally(() => void releaseOffscreen());

  return buildTasks;
};

export const offscreenClient = {
  buildActions: (
    transactionPlan: TransactionPlan,
    witness: WitnessData,
    fullViewingKey: FullViewingKey,
    cancel: PromiseLike<never>,
  ) => buildOffscreen<Action>(transactionPlan, witness, fullViewingKey, 'action', cancel),

  buildCircuitInputs: (
    transactionPlan: TransactionPlan,
    witness: WitnessData,
    fullViewingKey: FullViewingKey,
    cancel: PromiseLike<never>,
  ) =>
    buildOffscreen<{ witness: Uint8Array; public_inputs: number }>(
      transactionPlan,
      witness,
      fullViewingKey,
      'witness',
      cancel,
    ),
};
