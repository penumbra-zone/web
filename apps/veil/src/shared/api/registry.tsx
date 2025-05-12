import { Registry } from '@penumbra-labs/registry';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { createContext, useContext } from 'react';
import { JsonRegistryWithGlobals } from './fetch-registry';

export interface RegistryWithGlobals {
  stakingAssetId: AssetId;
  registry: Registry;
}

const RegistryContext = createContext<RegistryWithGlobals | undefined>(undefined);

export const RegistryProvider = ({
  value,
  children,
}: React.PropsWithChildren<{ value: JsonRegistryWithGlobals }>) => {
  const parsedValue: RegistryWithGlobals = {
    stakingAssetId: AssetId.fromJson({ inner: value.stakingAssetIdBase64 }),
    registry: new Registry(value.registry),
  };
  return <RegistryContext.Provider value={parsedValue}>{children}</RegistryContext.Provider>;
};

const useRegistryWithGlobals = (): RegistryWithGlobals => {
  const value = useContext(RegistryContext);
  if (!value) {
    throw new Error(
      'No RegistryProvider in ambient scope, make sure to wrap this component in one',
    );
  }
  return value;
};

export const useRegistry = () => {
  const data = useRegistryWithGlobals().registry;
  return { data };
};

export const useRegistryAssets = () => {
  const { registry } = useRegistryWithGlobals();
  const data = registry
    .getAllAssets()
    .sort((a, b) => Number(b.priorityScore) - Number(a.priorityScore));
  return { data, isLoading: false };
};

export const useStakingTokenMetadata = () => {
  const { stakingAssetId, registry } = useRegistryWithGlobals();
  const data = registry.getMetadata(stakingAssetId);
  return { data, isLoading: false };
};
