import { SelectList } from '@penumbra-zone/ui/components/ui/select-list';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { useMemo } from 'react';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { useChainIdQuery } from '../../../hooks/chain-id';
import { bech32mAssetId } from '@penumbra-zone/bech32m/passet';
import { getAssetId } from '@penumbra-zone/getters/metadata';

const getNumeraireFromRegistry = (chainId: string): Metadata[] => {
  const registryClient = new ChainRegistryClient();
  const registry = registryClient.get(chainId);
  return registry.numeraires.map(n => registry.getMetadata(n));
};

const useNumerairesSelector = (state: AllSlices) => {
  return {
    selectedNumeraires: state.numeraires.selectedNumeraires,
    selectNumeraire: state.numeraires.selectNumeraire,
    saveNumeraires: state.numeraires.saveNumeraires,
  };
};

export const NumeraireForm = ({ isOnboarding }: { isOnboarding?: boolean }) => {
  const { chainId } = useChainIdQuery();
  const { selectedNumeraires, selectNumeraire, saveNumeraires } =
    useStoreShallow(useNumerairesSelector);
  const frontends = useMemo(
    () => getNumeraireFromRegistry(chainId || 'penumbra-testnet-deimos-8'),
    [chainId],
  );

  return (
    <SelectList>
      {frontends.map(metadata => {
        const icon = metadata.images[0]?.png || metadata.images[0]?.svg;
        return (
          <SelectList.Option
            key={bech32mAssetId(getAssetId(metadata))}
            value={getAssetId(metadata).toJsonString()}
            label={metadata.symbol}
            isSelected={selectedNumeraires.includes(getAssetId(metadata).toJsonString())}
            onSelect={() => selectNumeraire(getAssetId(metadata).toJsonString())}
            image={
              !!icon && (
                <img
                  src={icon}
                  className='size-full object-contain'
                  alt='rpc endpoint brand image'
                />
              )
            }
          />
        );
      })}

      <Button
        className='my-5'
        key='save-button'
        variant='gradient'
        type={isOnboarding ? 'submit' : 'button'}
        onClick={saveNumeraires}
      >
        {isOnboarding ? 'Next' : 'Save'}
      </Button>
    </SelectList>
  );
};
