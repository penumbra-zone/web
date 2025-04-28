import { LoaderFunction } from 'react-router-dom';
import { GetStatusResponse } from '@penumbra-zone/protobuf/penumbra/util/tendermint_proxy/v1/tendermint_proxy_pb';
import { tendermintClient } from '../clients/grpc';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';

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
  uintArr
    ? uint8ArrayToHex(new Uint8Array(await crypto.subtle.digest('SHA-256', uintArr)))
    : undefined;
