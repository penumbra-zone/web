import { SelectList } from '@penumbra-zone/ui/components/ui/select-list';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { useMemo, useRef } from 'react';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { useChainIdQuery } from '../../../hooks/chain-id';
import { bech32mAssetId } from '@penumbra-zone/bech32m/passet';
import { getAssetId } from '@penumbra-zone/getters/metadata';
import { useIsFocus } from '../default-frontend-form/use-is-focus';

const getNumeraireFromRegistry = (chainId: string): Metadata[] => {
  const registryClient = new ChainRegistryClient();
  const registry = registryClient.get(chainId);
  return registry.numeraires.map(n => registry.getMetadata(n));
};

const useNumerairesSelector = (state: AllSlices) => {
  return {
    selectedNumeraires: state.numeraires.selectedNumeraires,
    setNumeraires: state.numeraires.addNumeraire,
  };
};

export const NumeraireForm = ({ isOnboarding }: { isOnboarding?: boolean }) => {
  const { chainId } = useChainIdQuery();
  const { selectedNumeraires, setNumeraires } = useStoreShallow(useNumerairesSelector);
  const frontends = useMemo(
    () => getNumeraireFromRegistry(chainId || 'penumbra-testnet-deimos-8'),
    [chainId],
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const isFocused = useIsFocus(inputRef);

  return (
    <SelectList>
      {frontends.map(option => (
        <SelectList.Option
          key={bech32mAssetId(getAssetId(option))}
          value={getAssetId(option).toJsonString()}
          secondary={getAssetId(option).toJsonString()}
          label={option.symbol}
          isSelected={selectedNumeraires.includes(getAssetId(option).toJsonString())}
          onSelect={setNumeraires}
        />
      ))}

      <div key='add-to-list' className='my-1 text-right'>
        <a
          href='https://github.com/prax-wallet/registry'
          target='_blank'
          rel='noreferrer'
          className='text-xs text-muted-foreground'
        >
          Add to this list
        </a>
      </div>

      {(isOnboarding ?? isFocused) && (
        <Button
          key='save-button'
          variant='gradient'
          disabled={isOnboarding}
          type={isOnboarding ? 'submit' : 'button'}
        >
          {isOnboarding ? 'Next' : 'Save'}
        </Button>
      )}
    </SelectList>
  );
};
