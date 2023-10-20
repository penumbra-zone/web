import {
  StatusStreamRequest,
  StatusStreamResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ServicesInterface } from '@penumbra-zone/types';
import { ViewReqMessage } from './router';

export const isStatusStreamRequest = (msg: ViewReqMessage): msg is StatusStreamRequest => {
  return msg.getType().typeName === StatusStreamRequest.typeName;
};

export const handleStatusReq = async function* (
  // TODO: Support req.wallet filter
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: StatusStreamRequest,
  services: ServicesInterface,
): AsyncIterable<StatusStreamResponse> {
  const { indexedDb } = await services.getWalletServices();
  const latestBlockHeight = await services.querier.tendermint.latestBlockHeight();

  // As syncing does not end, nor does this stream.
  // It waits for events triggered externally when block sync has progressed.
  const subscription = indexedDb.subscribe('LAST_BLOCK_SYNCED');

  for await (const update of subscription) {
    const syncHeight = update.value;
    yield new StatusStreamResponse({
      latestKnownBlockHeight: syncHeight >= latestBlockHeight ? syncHeight : latestBlockHeight,
      syncHeight,
    });
  }
};
