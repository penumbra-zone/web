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
    inputRef.current?.addEventListener('wheel', onWheel);

    return () => {
      inputRef.current?.removeEventListener('wheel', onWheel);
    };
  }, []);

  return inputRef;
};
