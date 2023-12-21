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
import { JsonValue } from '@bufbuild/protobuf';
import { Jsonified } from '@penumbra-zone/types';

export type OffscreenMessage = ActionBuildMessage;
export type OffscreenRequest = InternalRequest<OffscreenMessage>;
export type OffscreenResponse = InternalResponse<ActionBuildMessage>;

export interface ActionBuildMessagePayload {
  transactionPlan: JsonValue;
  witness: JsonValue;
  fullViewingKey: string;
  length: number;
}

export interface WebWorkerMessagePayload {
  transactionPlan: TransactionPlan;
  witness: WitnessData;
  fullViewingKey: string;
  actionId: number;
}

// export interface WebWorkerMessagePayload {
//   transactionPlan: Jsonified<TransactionPlan>;
//   witness: Jsonified<WitnessData>;
//   fullViewingKey: string;
//   actionId: number;
// }

export type ActionBuildMessage = InternalMessage<
  'BUILD_ACTION',
  ActionBuildMessagePayload,
  Action[]
>;
