import { Action } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { InternalMessage, InternalRequest, InternalResponse } from './shared';
import { JsonObject, JsonValue } from '@bufbuild/protobuf';

export type ActionBuildMessage = InternalMessage<
  'BUILD_ACTION',
  ActionBuildRequest,
  ActionBuildResponse
>;

export type OffscreenMessage = ActionBuildMessage;
export type OffscreenRequest = InternalRequest<OffscreenMessage>;
export type OffscreenResponse = InternalResponse<OffscreenMessage>;

export interface ActionBuildRequest {
  transactionPlan: JsonObject & { actions: JsonValue[] };
  witness: JsonObject;
  fullViewingKey: string;
}
export type ActionBuildResponse = ActionJsonValue<ActionCase>[];

export type WasmTaskInput = ActionBuildRequest & { actionPlanIndex: number };

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
