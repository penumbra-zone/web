import {
  InternalMessage,
  InternalRequest,
  InternalResponse,
} from '@penumbra-zone/types/src/internal-msg/shared';
import { WitnessAndBuildRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import {
  TransactionPlan,
  WitnessData,
  ActionPlan,
  Action,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { JsonValue } from '@bufbuild/protobuf';

export type OffscreenMessage = ActionBuildMessage;
export type OffscreenRequest = InternalRequest<OffscreenMessage>;
export type OffscreenResponse = InternalResponse<ActionBuildMessage>;

export interface ActionBuildMessagePayload {
  transactionPlan: TransactionPlan;
  actionPlan: ActionPlan[];
  witness: WitnessData;
  fullViewingKey: string;
  key_type: string[];
}

export interface WebWorkerMessagePayload {
  transactionPlan: JsonValue;
  actionPlan: JsonValue;
  witness: JsonValue;
  fullViewingKey: string;
  key_type: string;
}

export type ActionBuildMessage = InternalMessage<
  'BUILD_ACTION',
  ActionBuildMessagePayload,
  Action[]
>;

const request: OffscreenRequest['type'][] = ['BUILD_ACTION'];

export const isOffscreenRequest = (req: unknown): req is OffscreenRequest => {
  return (
    req != null &&
    typeof req === 'object' &&
    'type' in req &&
    typeof req.type === 'string' &&
    request.includes(req.type as OffscreenRequest['type'])
  );
};

export const offscreenClient = {
  buildAction: (
    arg: WitnessAndBuildRequest,
    witness: WitnessData,
    fullViewingKey: string,
    key_type: string[],
  ): Promise<InternalResponse<ActionBuildMessage>> =>
    sendOffscreenMessage<ActionBuildMessage>({
      type: 'BUILD_ACTION',
      request: {
        transactionPlan: arg.transactionPlan!,
        actionPlan: arg.transactionPlan!.actions,
        witness,
        fullViewingKey,
        key_type,
      },
    }),
};

export const sendOffscreenMessage = async <T extends OffscreenMessage>(
  req: InternalRequest<T>,
): Promise<InternalResponse<T>> => {
  try {
    return await chrome.runtime.sendMessage(req);
  } catch (e) {
    return { type: req.type, error: e };
  }
};
