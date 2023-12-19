import {
  InternalMessage,
  InternalRequest,
  InternalResponse,
} from '@penumbra-zone/types/src/internal-msg/shared';
import {
  ActionPlan,
  TransactionPlan,
  WitnessData,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { JsonValue } from '@bufbuild/protobuf';
import { Jsonified } from '@penumbra-zone/types';

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
  transactionPlan: Jsonified<TransactionPlan>;
  actionPlan: Jsonified<ActionPlan>;
  witness: Jsonified<WitnessData>;
  fullViewingKey: string;
  keyType: string;
}

export type ActionBuildMessage = InternalMessage<
  'BUILD_ACTION',
  ActionBuildMessagePayload,
  JsonValue[] // Action[]
>;
