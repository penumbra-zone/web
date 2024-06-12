import { Transport, createPromiseClient } from '@connectrpc/connect';
import { TendermintProxyService } from '@penumbra-zone/protobuf';

export const queryBlockHeight = async (fullnode: Transport) => {
  const tendermint = createPromiseClient(TendermintProxyService, fullnode);

  const { syncInfo } = (await tendermint.getStatus({}).catch(() => undefined)) ?? {};

  return syncInfo?.latestBlockHeight;
};
