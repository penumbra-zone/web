import { ChainRegistryClient } from '@penumbra-labs/registry';
import { useQuery } from '@tanstack/react-query';
import { envQueryFn } from './env/env';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export const chainRegistryClient = new ChainRegistryClient();

const registryQueryFn = async () => {
  const env = await envQueryFn();
  return chainRegistryClient.remote.get(env.PENUMBRA_CHAIN_ID);
};

export const useRegistryAssets = () => {
  return useQuery({
    queryKey: ['penumbraRegistryAssets'],
    queryFn: async (): Promise<Metadata[]> => {
      const registry = await registryQueryFn();
      return registry.getAllAssets();
    },
    staleTime: Infinity,
  });
};

export const useRegistry = () => {
  return useQuery({
    queryKey: ['penumbraRegistry'],
    queryFn: registryQueryFn,
    staleTime: Infinity,
  });
};
