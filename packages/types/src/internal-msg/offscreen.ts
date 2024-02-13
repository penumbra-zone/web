import type {
  Action,
  TransactionPlan,
  WitnessData,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import type { Jsonified } from '../jsonified';
import type { InternalMessage, InternalRequest, InternalResponse } from './shared';

export type ActionBuildMessage = InternalMessage<
  'BUILD_ACTION',
  ActionBuildRequest,
  ActionBuildResponse
>;

export type OffscreenMessage = ActionBuildMessage;
export type OffscreenRequest = InternalRequest<OffscreenMessage>;
export type OffscreenResponse = InternalResponse<OffscreenMessage>;

export interface ActionBuildRequest {
  transactionPlan: Jsonified<TransactionPlan> & {
    actions: Jsonified<TransactionPlan['actions']>;
  };
  witness: Jsonified<WitnessData>;
  fullViewingKey: string;
  actionPlanIndex: number;
}
export type ActionBuildResponse = Jsonified<Action>;

export const isActionBuildRequest = (req: unknown): req is ActionBuildRequest =>
  req != null &&
  typeof req === 'object' &&
  'transactionPlan' in req &&
  req.transactionPlan != null &&
  typeof req.transactionPlan === 'object' &&
  'actions' in req.transactionPlan &&
  Array.isArray(req.transactionPlan.actions) &&
  'witness' in req &&
  req.witness != null &&
  typeof req.witness === 'object' &&
  'fullViewingKey' in req &&
  typeof req.fullViewingKey === 'string' &&
  'actionPlanIndex' in req &&
  typeof req.actionPlanIndex === 'number';
