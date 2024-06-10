import { SelectList } from '@penumbra-zone/ui/components/ui/select-list';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { randomSort } from '../utils/random-sort';
import { AllSlices } from '../../state';
import { useStoreShallow } from '../../utils/use-store-shallow';
import {
  FocusEventHandler,
  KeyboardEventHandler,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button } from '@penumbra-zone/ui/components/ui/button';

// Extracts the first-level domain from a URL – needed to display the title
const extractDomain = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    const parts = hostname.split('.');

    if (parts.length >= 2) {
      return parts.slice(-2).join('.');
    }

    return hostname;
  } catch (e) {
    return '';
  }
};

const getFrontendsFromRegistry = () => {
  const registryClient = new ChainRegistryClient();
  const { frontends } = registryClient.globals();
  return frontends.toSorted(randomSort);
};

// Subscribe to the focus state of any given element
const useIsFocus = (ref: MutableRefObject<HTMLElement | null>): boolean => {
  const [isFocus, setIsFocus] = useState(false);

  const onFocus = () => setIsFocus(true);
  const onBlur = () => setIsFocus(false);

  useEffect(() => {
    const element = ref.current;
    element?.addEventListener('focusin', onFocus);
    element?.addEventListener('focusout', onBlur);
    return () => {
      element?.removeEventListener('focusin', onFocus);
      element?.removeEventListener('focusout', onBlur);
    };
  }, [ref]);

  return isFocus;
};

const useDefaultFrontendSelector = (state: AllSlices) => {
  const frontends = getFrontendsFromRegistry();
  return {
    frontends,
    selected: state.defaultFrontend.url,
    selectUrl: state.defaultFrontend.setUrl,
    isCustomSelected: !!state.defaultFrontend.url && !frontends.includes(state.defaultFrontend.url),
  };
};

const NewFrontendInput = ({
  selected,
  customValue,
  onSelect,
}: {
  customValue?: string;
  selected: boolean;
  onSelect: (url: string) => void;
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isFocus = useIsFocus(inputRef);

  const [customFrontend, setCustomFrontend] = useState<string>(customValue ?? '');

  const onBlur: FocusEventHandler<HTMLInputElement> = () => {
    if (!customFrontend) return;
    onSelect(customFrontend);
  };

  const onEnter: KeyboardEventHandler<HTMLInputElement> = event => {
    if (event.key === 'Enter') {
      inputRef.current?.blur();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setCustomFrontend(customValue ?? '');
      inputRef.current?.blur();
    }
  };

  const onFocus = () => {
    setCustomFrontend('');
    inputRef.current?.focus();
  };

  return (
    <>
      <SelectList.Option
        key='custom-input'
        label='Custom frontend URL'
        secondary={
          <input
            type='url'
            ref={inputRef}
            value={customFrontend}
            placeholder='https://example.com'
            className='w-full bg-transparent'
            onInput={event => setCustomFrontend(event.currentTarget.value)}
            onKeyDown={onEnter}
            onBlur={onBlur}
          />
        }
        onSelect={onFocus}
        isSelected={selected}
      />

      <div key='add-to-list' className='mt-1 text-right'>
        <a
          href='https://github.com/prax-wallet/registry'
          target='_blank'
          rel='noreferrer'
          className='text-xs text-muted-foreground'
        >
          Add to this list
        </a>
      </div>

      {/* The button is only needed to trigger the blur event */}
      {isFocus && (
        <Button key='save-button' variant='gradient' type='button'>
          Save
        </Button>
      )}
    </>
  );
};

export const DefaultFrontendForm = () => {
  const { selected, selectUrl, frontends, isCustomSelected } = useStoreShallow(
    useDefaultFrontendSelector,
  );

  return (
    <SelectList>
      {frontends.map(option => (
        <SelectList.Option
          key={option}
          value={option}
          secondary={option}
          label={extractDomain(option)}
          isSelected={option === selected}
          onSelect={selectUrl}
        />
      ))}
      <NewFrontendInput
        customValue={isCustomSelected ? selected : undefined}
        selected={isCustomSelected}
        onSelect={selectUrl}
      />
    </SelectList>
  );
};
