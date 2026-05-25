import type {
  Action,
  AuthorizationData,
  Transaction,
  TransactionPlan,
  WitnessData,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import type { Jsonified } from '../jsonified.js';
import type { InternalMessage, InternalRequest, InternalResponse } from './shared.js';
import { FullViewingKey } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

export type ActionBuildMessage = InternalMessage<
  'BUILD_ACTION',
  ActionBuildRequest,
  ActionBuildResponse
>;

export type ParallelBuildMessage = InternalMessage<
  'BUILD_PARALLEL',
  ParallelBuildRequest,
  ParallelBuildResponse
>;

export type OffscreenMessage = ActionBuildMessage | ParallelBuildMessage;
export type OffscreenRequest = InternalRequest<OffscreenMessage>;
export type OffscreenResponse = InternalResponse<OffscreenMessage>;

export interface ActionBuildRequest {
  transactionPlan: Jsonified<TransactionPlan>;
  witness: Jsonified<WitnessData>;
  fullViewingKey: Jsonified<FullViewingKey>;
  actionPlanIndex: number;
}
export type ActionBuildResponse = Jsonified<Action>;

export interface ParallelBuildRequest {
  transactionPlan: Jsonified<TransactionPlan>;
  witness: Jsonified<WitnessData>;
  fullViewingKey: Jsonified<FullViewingKey>;
  authData: Jsonified<AuthorizationData>;
}
export type ParallelBuildResponse = Jsonified<Transaction>;

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
  typeof req.fullViewingKey === 'object' &&
  'actionPlanIndex' in req &&
  typeof req.actionPlanIndex === 'number';

export const isParallelBuildRequest = (req: unknown): req is ParallelBuildRequest =>
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
  typeof req.fullViewingKey === 'object' &&
  'authData' in req &&
  typeof req.authData === 'object' &&
  !('actionPlanIndex' in req);

export const isOffscreenRequest = (req: unknown): req is OffscreenRequest =>
  req != null &&
  typeof req === 'object' &&
  'type' in req &&
  typeof req.type === 'string' &&
  (req.type === 'BUILD_ACTION' || req.type === 'BUILD_PARALLEL');
