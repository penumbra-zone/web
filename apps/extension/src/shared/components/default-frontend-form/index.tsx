import { SelectList } from '@penumbra-zone/ui/components/ui/select-list';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { useRef } from 'react';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { NewFrontendInput } from './new-frontend-input';
import { useIsFocus } from './use-is-focus';
import { extractDomain } from './extract-domain';

const getFrontendsFromRegistry = (): { title: string; url: string }[] => {
  const registryClient = new ChainRegistryClient();
  const { frontends, rpcs } = registryClient.globals();

  const registeredFrontends = frontends.map(frontend => ({
    title: extractDomain(frontend),
    url: frontend,
  }));
  const rpcFrontends = rpcs.map(rpc => ({ title: rpc.name, url: `${rpc.url}/app/` }));

  return [...registeredFrontends, ...rpcFrontends];
};

const useDefaultFrontendSelector = (state: AllSlices) => {
  const frontends = getFrontendsFromRegistry();
  return {
    frontends,
    selected: state.defaultFrontend.url,
    selectUrl: state.defaultFrontend.setUrl,
    isCustomSelected:
      !!state.defaultFrontend.url &&
      !frontends.some(item => item.url === state.defaultFrontend.url),
  };
};

export const DefaultFrontendForm = ({ isOnboarding }: { isOnboarding?: boolean }) => {
  const { selected, selectUrl, frontends, isCustomSelected } = useStoreShallow(
    useDefaultFrontendSelector,
  );

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
          isSelected={option.url === selected}
          onSelect={selectUrl}
        />
      ))}

      <NewFrontendInput
        key='custom-input'
        ref={inputRef}
        defaultFrontend={selected}
        selected={isCustomSelected}
        onSelect={selectUrl}
      />

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
          disabled={isOnboarding && !selected}
          type={isOnboarding ? 'submit' : 'button'}
        >
          {isOnboarding ? 'Next' : 'Save'}
        </Button>
      )}
    </SelectList>
  );
};
