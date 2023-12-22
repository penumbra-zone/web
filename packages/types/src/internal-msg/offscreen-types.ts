import { Action } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb";
import { InternalMessage, InternalRequest, InternalResponse } from "./shared";
import { JsonValue } from "@bufbuild/protobuf";

export type ActionBuildMessage = InternalMessage<
  'BUILD_ACTION',
  OffscreenRequestPayload,
  Action[]
>;

export type OffscreenMessage = ActionBuildMessage;
export type OffscreenRequest = InternalRequest<OffscreenMessage>;
export type OffscreenResponse = InternalResponse<ActionBuildMessage>;

interface OffscreenRequestPayload {
  transactionPlan: JsonValue;
  witness: JsonValue;
  fullViewingKey: string;
}