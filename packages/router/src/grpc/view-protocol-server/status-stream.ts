import {
  StatusStreamRequest,
  StatusStreamResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { Looper } from 'penumbra-transport';
import { IdbUpdateNotifier } from 'penumbra-storage/src/indexed-db/updater';
import { PenumbraDb, ServicesInterface } from 'penumbra-types';
import { ViewReqMessage } from './router';

export const isStatusStreamRequest = (msg: ViewReqMessage): msg is StatusStreamRequest => {
  return msg.getType().typeName === StatusStreamRequest.typeName;
};

// TODO: FIX THIS
const statusReqLooper = new Looper<bigint>();
export const syncLastBlockWithStatusReq = (): IdbUpdateNotifier<
  PenumbraDb,
  'LAST_BLOCK_SYNCED'
> => {
  return {
    table: 'LAST_BLOCK_SYNCED',
    handler: val => statusReqLooper.run(val),
  };
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
  // It waits for loop events triggered externally when block sync has progressed.
  while (true) {
    const syncHeight = (await indexedDb.getLastBlockSynced()) ?? 0n;

    yield new StatusStreamResponse({
      latestKnownBlockHeight: syncHeight >= latestBlockHeight ? syncHeight : latestBlockHeight,
      syncHeight,
    });

    await new Promise(resolve => statusReqLooper.set(resolve));
  }
};
