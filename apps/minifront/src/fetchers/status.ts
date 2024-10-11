import { ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '../penumbra';

const getInitialStatus = () =>
  penumbra
    .service(ViewService)
    .status({})
    .then(status => ({
      fullSyncHeight: status.fullSyncHeight,
      latestKnownBlockHeight: status.catchingUp ? undefined : status.fullSyncHeight,
    }));

export async function* getStatusStream(): AsyncGenerator<{
  fullSyncHeight?: bigint;
  latestKnownBlockHeight?: bigint;
}> {
  // `statusStream` sends new data to stream only when a new block is detected.
  // This can take up to 5 seconds (time of new block generated).
  // Therefore, we need to do a unary request to start us off.
  yield await getInitialStatus();

  for await (const result of penumbra.service(ViewService).statusStream({})) {
    yield {
      fullSyncHeight: result.fullSyncHeight,
      latestKnownBlockHeight: result.latestKnownBlockHeight,
    };
  }
}
