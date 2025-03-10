import { useCallback, useEffect, useRef, useState } from 'react';

type AssetType = 'base' | 'quote';

export const useFocus = (isOpen: boolean) => {
  const baseRef = useRef<HTMLInputElement>(null);
  const quoteRef = useRef<HTMLInputElement>(null);

  const [focusedType, setFocusedType] = useState<AssetType | undefined>();

  const manageFocus = useCallback(
    (type: AssetType) => {
      const onFocusIn = () => setFocusedType(type);

      const ref = type === 'base' ? baseRef : quoteRef;
      let input = ref.current;

      if (isOpen) {
        setTimeout(() => {
          if (ref.current) {
            input = ref.current;
            input.addEventListener('focusin', onFocusIn);
          }
        }, 0);
      }

      return () => {
        if (input) {
          input.removeEventListener('focusin', onFocusIn);
        }
      };
    },
    [isOpen],
  );

  const clearFocus = () => {
    setFocusedType(undefined);
  };

  useEffect(() => {
    return manageFocus('base');
  }, [manageFocus]);

  useEffect(() => {
    return manageFocus('quote');
  }, [manageFocus]);

  return { focusedType, baseRef, quoteRef, clearFocus };
};
