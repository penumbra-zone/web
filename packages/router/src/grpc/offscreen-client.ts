import { WitnessAndBuildRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import {
  Action,
  WitnessData,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { JsonObject, JsonValue } from '@bufbuild/protobuf';

const OFFSCREEN_DOCUMENT_PATH = '/offscreen.html';

interface OffscreenRequest {
  offscreen: 'BUILD_ACTION';
  transactionPlan: UnknownTransactionPlan;
  witness: JsonValue;
  fullViewingKey: string;
}

type ActionName = 'spend' | 'output' | 'delegatorVote' | 'swap' | 'swapClaim';

//type UnknownAction = Pick<{ [k in ActionName]: JsonObject }, ActionName>
type UnknownAction = Pick<{ [k in ActionName]: JsonObject }, ActionName>;
type UnknownTransactionPlan = JsonObject & { actions: UnknownAction[] };

export const offscreenClient = {
  buildAction: (
    arg: WitnessAndBuildRequest,
    witness: WitnessData,
    fullViewingKey: string,
  ): Promise<Action[]> =>
    sendActionBuildMessage({
      offscreen: 'BUILD_ACTION',
      transactionPlan: arg.transactionPlan!.toJson() as UnknownTransactionPlan,
      witness: witness.toJson(),
      fullViewingKey,
    }),
};

export const sendActionBuildMessage = async (req: OffscreenRequest): Promise<Action[]> => {
  console.log('Entered sendOffscreenMessage!', req);
  void chrome.offscreen.closeDocument().catch(() => {
    /* noop */
  });
  await new Promise(resolve => setTimeout(resolve, 1000));
  await chrome.offscreen.createDocument({
    url: OFFSCREEN_DOCUMENT_PATH,
    reasons: [chrome.offscreen.Reason.WORKERS],
    justification: 'spawn web workers from offscreen document',
  });
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('sendOffscreen: ', req.transactionPlan);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const result = (await chrome.runtime.sendMessage({ ...req, asdf: 'jkl' })) as
    | JsonObject
    | JsonValue[];

  console.log('result', result);

  // Close offscreen document
  // await chrome.offscreen.closeDocument();
  const actions = Object.values(result).map(actionJson => Action.fromJson(actionJson));

  return actions;
};
