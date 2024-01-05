import { Action } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { InternalMessage, InternalRequest, InternalResponse } from './internal-message';
import { JsonObject, JsonValue } from '@bufbuild/protobuf';
import { WitnessAndBuildRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { WitnessData } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

const OFFSCREEN_DOCUMENT_PATH = '/offscreen.html';

export type ActionBuildMessage = InternalMessage<
  'BUILD_ACTION',
  ActionBuildRequest,
  ActionBuildResponse
>;

export type OffscreenMessage = ActionBuildMessage;
export type OffscreenRequest = InternalRequest<OffscreenMessage>;

export interface ActionBuildRequest {
  transactionPlan: JsonObject & { actions: JsonValue[] };
  witness: JsonObject;
  fullViewingKey: string;
}
export type ActionBuildResponse = ActionJsonValue<ActionCase>[];

export type WasmBuildActionInput = ActionBuildRequest & { actionPlanIndex: number };

type ActionCase = NonNullable<Action['action']['case']>;
type ActionJsonValue<C extends ActionCase> = Record<C, JsonValue>;

const hasActionPlanJsonArray = (x: JsonValue): x is JsonObject & { actions: JsonValue[] } =>
  x != null && typeof x === 'object' && 'actions' in x && Array.isArray(x['actions']);

export const isActionBuildRequest = (req: unknown): req is ActionBuildRequest =>
  req != null &&
  typeof req === 'object' &&
  'transactionPlan' in req &&
  hasActionPlanJsonArray(req.transactionPlan as JsonObject) &&
  'witness' in req &&
  typeof req.witness === 'object' &&
  req.witness != null &&
  'fullViewingKey' in req &&
  typeof req.fullViewingKey === 'string';

interface ContextsRequest {
  contextTypes: string[];
  documentUrls: string[];
}

let active = 0;

const activateOffscreen = async () => {
  // @ts-expect-error: no types available yet
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

  return buildRes.data.map(a => Action.fromJson(a));
};

export const offscreenControl = { buildAction };
