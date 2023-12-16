import { InternalMessage, InternalRequest, InternalResponse } from '@penumbra-zone/types/src/internal-msg/shared';
import { WitnessAndBuildRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { TransactionPlan, WitnessData, AuthorizationData, ActionPlan, Action } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

export type OffscreenMessage = ActionBuildMessage;
export type OffscreenRequest = InternalRequest<OffscreenMessage>;
export type OffscreenResponse = InternalResponse<ActionBuildMessage>;

export type ActionBuildMessage = InternalMessage<
  'ACTION_AND_BUILD',
  { 
    transactionPlan: TransactionPlan, 
    actionPlan: ActionPlan[], 
    witness: WitnessData, 
    fullViewingKey: string, 
    key_type: string[]
  },
  Action[]
>;

const request: OffscreenRequest['type'][] = ['ACTION_AND_BUILD'];

export const isOffscreenRequest = (req: unknown): req is OffscreenRequest => {
  return (
    req != null && 
    typeof req === 'object' && 
    'type' in req && 
    typeof req.type === 'string' && 
    request.includes(req.type as OffscreenRequest['type'])
  );
};

export const offscreenClient = { buildAction: (
  arg: WitnessAndBuildRequest, 
  witness: WitnessData, 
  fullViewingKey: string,
  key_type: string[]
) =>
    sendOffscreenMessage<ActionBuildMessage>({ 
      type: 'ACTION_AND_BUILD', 
      request: {
        transactionPlan: arg.transactionPlan!, 
        actionPlan: arg.transactionPlan!.actions!, 
        witness, 
        fullViewingKey, 
        key_type
      }, 
      target: 'target' }),
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