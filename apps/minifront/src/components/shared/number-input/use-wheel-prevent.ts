import { useEffect, useRef } from 'react';

/**
 * Prevents the wheel event from changing the value of the number input.
 *
 * Classic listeners are used because React's `onWheel` prop sets `passive: true` on
 * the event listener, and it can't be prevented.
 */
export const useWheelPrevent = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  useEffect(() => {
    const ac = new AbortController();
    inputRef.current?.addEventListener('wheel', onWheel, { signal: ac.signal });
    return () => ac.abort();
  }, []);

  return inputRef;
};
