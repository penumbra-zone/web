// Subscribe to the focus state of any given element
import { MutableRefObject, useEffect, useState } from 'react';

export const useIsFocus = (ref: MutableRefObject<HTMLElement | null>): boolean => {
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
