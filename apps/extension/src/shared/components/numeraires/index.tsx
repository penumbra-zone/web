import { SelectList } from '@penumbra-zone/ui/components/ui/select-list';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { useMemo, useRef } from 'react';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { useIsFocus } from './use-is-focus';
import { extractDomain } from './extract-domain';
import {Metadata} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb";


const getNumeraireFromRegistry = (selectedRpc?: string): Metadata[] => {
    const registryClient = new ChainRegistryClient();
    const { frontends } = registryClient.globals();

    const registeredFrontends = frontends.map(frontend => ({
        title: extractDomain(frontend),
        url: frontend,
    }));

    if (selectedRpc) {
        registeredFrontends.push({ title: 'Embedded RPC frontend', url: `${selectedRpc}/app/` });
    }

    return registeredFrontends;
};


const useDefaultFrontendSelector = (state: AllSlices) => {
    return {
        selectedFrontend: state.defaultFrontend.url,
        selectUrl: state.defaultFrontend.setUrl,
        selectedRpc: state.network.grpcEndpoint,
    };
};

export const DefaultFrontendForm = ({ isOnboarding }: { isOnboarding?: boolean }) => {
    const { selectedFrontend, selectUrl, selectedRpc } = useStoreShallow(useDefaultFrontendSelector);
    const frontends = useMemo(() => getFrontendsFromRegistry(selectedRpc), [selectedRpc]);

    const inputRef = useRef<HTMLInputElement>(null);
    const isFocused = useIsFocus(inputRef);

    return (
        <SelectList>
            {frontends.map(option => (
                <SelectList.Option
                    key={option.url}
                    value={option.url}
                    secondary={option.url}
                    label={option.title}
                    isSelected={option.url === selectedFrontend}
                    onSelect={selectUrl}
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
                    disabled={isOnboarding && !selectedFrontend}
                    type={isOnboarding ? 'submit' : 'button'}
                >
                    {isOnboarding ? 'Next' : 'Save'}
                </Button>
            )}
        </SelectList>
    );
};
