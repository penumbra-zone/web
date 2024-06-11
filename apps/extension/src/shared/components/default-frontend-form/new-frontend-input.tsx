import {
  FocusEventHandler,
  ForwardedRef,
  forwardRef,
  KeyboardEventHandler,
  MutableRefObject,
  useRef,
  useState,
} from 'react';
import { SelectList } from '@penumbra-zone/ui/components/ui/select-list';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { isValidUrl } from '../../utils/is-valid-url';

const isValidAndNotInitial = (url: string, initialUrl?: string): boolean => {
  return isValidUrl(url) && url !== initialUrl;
};

const mergeRefs = <EL extends HTMLElement>(
  ...refs: (MutableRefObject<EL> | ForwardedRef<EL>)[]
) => {
  return (node: EL) => {
    for (const ref of refs) {
      if (ref && typeof ref === 'object') {
        ref.current = node;
      }
    }
  };
};

interface NewFrontendInputProps {
  defaultFrontend?: string;
  selected: boolean;
  onSelect: (url: string) => void;
}

export const NewFrontendInput = forwardRef<HTMLInputElement, NewFrontendInputProps>(
  ({ selected, defaultFrontend, onSelect }, ref) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const customValue = defaultFrontend && selected ? defaultFrontend : '';

    const [customFrontend, setCustomFrontend] = useState<string>(customValue);
    const isError = !isValidAndNotInitial(customFrontend, defaultFrontend);

    const onBlur: FocusEventHandler<HTMLInputElement> = () => {
      if (!customFrontend || isError) {
        setCustomFrontend(customValue);
        return;
      }
      onSelect(customFrontend);
    };

    const onEnter: KeyboardEventHandler<HTMLInputElement> = event => {
      if (event.key === 'Enter') {
        inputRef.current?.blur();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        setCustomFrontend(customValue);
        inputRef.current?.blur();
      }
    };

    const onFocus = () => {
      setCustomFrontend('');
      inputRef.current?.focus();
    };

    return (
      <SelectList.Option
        key='opt1'
        label='Custom frontend'
        isSelected={selected}
        secondary={
          <input
            type='url'
            ref={mergeRefs(ref, inputRef)}
            value={customFrontend}
            placeholder='Enter the URL'
            className={cn(
              'w-full rounded border p-1 border-secondary bg-background hover:border-gray-400 focus:border-gray-400 transition outline-0',
            )}
            onInput={event => setCustomFrontend(event.currentTarget.value)}
            onKeyDown={onEnter}
            onBlur={onBlur}
          />
        }
        onSelect={onFocus}
      />
    );
  },
);
NewFrontendInput.displayName = 'NewFrontendInput';
