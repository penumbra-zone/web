import {
  StatusStreamRequest,
  StatusStreamResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewReqMessage } from './helpers/generic';
import { services } from '../../../service-worker';
import { Looper } from 'penumbra-transport';
import { IdbUpdateNotifier } from 'penumbra-storage/src/indexed-db/updater';
import { PenumbraDb } from 'penumbra-types';

export const isStatusStreamRequest = (msg: ViewReqMessage): msg is StatusStreamRequest => {
  return msg.getType().typeName === StatusStreamRequest.typeName;
};

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
): AsyncIterable<StatusStreamResponse> {
  const { indexedDb } = await services.getWalletServices();
  const latestBlockHeight = await services.querier.tendermint.latestBlockHeight();

  // As syncing does not end, nor does this stream.
  // It waits for loop events triggered externally when block sync has progressed.
  while (true) {
    const syncHeight = await indexedDb.getLastBlockSynced();

    yield new StatusStreamResponse({
      latestKnownBlockHeight: syncHeight >= latestBlockHeight ? syncHeight : latestBlockHeight,
      syncHeight,
    });

    await new Promise(resolve => statusReqLooper.set(resolve));
  }
};
