import { LoaderFunction } from 'react-router-dom';
import { GetStatusResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/util/tendermint_proxy/v1/tendermint_proxy_pb.js';
import { sha256HashStr } from '@penumbra-zone/crypto-web/sha256';
import { tendermintClient } from '../clients/grpc';

export interface IndexLoaderResponse {
  status: GetStatusResponse;
  latestBlockHash: string | undefined;
  latestAppHash: string | undefined;
}

export const IndexLoader: LoaderFunction = async (): Promise<IndexLoaderResponse> => {
  const status = await tendermintClient.getStatus({});
  const latestBlockHash = await getHash(status.syncInfo?.latestBlockHash);
  const latestAppHash = await getHash(status.syncInfo?.latestAppHash);

  return {
    status,
    latestBlockHash,
    latestAppHash,
  };
};

const getHash = async (uintArr?: Uint8Array): Promise<string | undefined> =>
  uintArr ? sha256HashStr(uintArr) : undefined;
