import {
  InternalMessage,
  InternalRequest,
  InternalResponse,
} from '@penumbra-zone/types/src/internal-msg/shared';
import {
  TransactionPlan,
  WitnessData,
  ActionPlan,
  Action,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

export type OffscreenMessage = ActionBuildMessage;
export type OffscreenRequest = InternalRequest<OffscreenMessage>;
export type OffscreenResponse = InternalResponse<ActionBuildMessage>;

export interface ActionBuildMessagePayload {
  transactionPlan: TransactionPlan;
  actionPlan: ActionPlan[];
  witness: WitnessData;
  fullViewingKey: string;
  keyType: string[];
}

export interface WebWorkerMessagePayload {
  transactionPlan: TransactionPlan;
  actionPlan: ActionPlan;
  witness: WitnessData;
  fullViewingKey: string;
  keyType: string;
}

export type ActionBuildMessage = InternalMessage<
  'BUILD_ACTION',
  ActionBuildMessagePayload,
  Action[]
>;
