import { ChainRegistryClient } from '@penumbra-labs/registry';
import { sample } from 'lodash';
import { useQuery } from '@tanstack/react-query';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { ViewService } from '@penumbra-zone/protobuf/penumbra/view/v1/view_connect';
import { envQueryFn } from '@/shared/api/env/env.ts';
import { penumbra } from '@/shared/const/penumbra.ts';
import { connectionStore } from '@/shared/model/connection';
import { queryClient } from '@/shared/const/queryClient';

const registryRpcChoices = async () => {
  const env = await envQueryFn();

  if (env.PENUMBRA_CHAIN_ID === 'penumbra-1') {
    const chainRegistryClient = new ChainRegistryClient();
    const { rpcs } = await chainRegistryClient.remote.globals();
    return rpcs.map(r => r.url);
  } else if (env.PENUMBRA_CHAIN_ID === 'penumbra-testnet-phobos-2') {
    return ['https://testnet.plinfra.net'];
  } else {
    throw new Error(`No rpcs for chain id: ${env.PENUMBRA_CHAIN_ID}`);
  }
};

// Verifies that the Dex explorer backend chain id matches the one Prax is connected to
const walletOnWrongChain = async () => {
  // If wallet is not connected, nothing to compare it to
  if (!connectionStore.connected) {
    return false;
  }

  const { parameters } = await penumbra.service(ViewService).appParameters({});
  const walletChainId = parameters?.chainId;
  if (!walletChainId) {
    throw new Error('Unable to retrieve chain id from wallet');
  }

  const env = await envQueryFn();
  return !!walletChainId && env.PENUMBRA_CHAIN_ID !== walletChainId;
};

enum TransportType {
  PRAX,
  GRPC_WEB,
}

const grpcTransportQueryFn = async () => {
  const wrongChain = await walletOnWrongChain();
  if (wrongChain) {
    throw new Error('Wallet connected to a different chain than backend');
  }

  if (connectionStore.connected && penumbra.transport) {
    return { transport: penumbra.transport, type: TransportType.PRAX };
  }

  const rpcChoices = await registryRpcChoices();
  const randomRpc = sample(rpcChoices);
  if (!randomRpc) {
    throw new Error('No rpcs in remote globals');
  }

  return {
    transport: createGrpcWebTransport({
      baseUrl: randomRpc,
    }),
    type: TransportType.GRPC_WEB,
  };
};

const getGrpcQueryOptions = () => ({
  queryKey: ['grpcTransport', connectionStore.connected],
  queryFn: grpcTransportQueryFn,
  staleTime: Infinity,
});

export const getGrpcTransport = () => {
  return queryClient.fetchQuery(getGrpcQueryOptions());
};

export const useGrpcTransport = () => {
  return useQuery(getGrpcQueryOptions());
};
