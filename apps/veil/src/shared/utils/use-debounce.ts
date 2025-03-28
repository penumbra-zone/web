import { useState, useEffect } from 'react';

/**
 * Respectfully copied from https://usehooks.com/usedebounce
 */
export const useDebounce = <VALUE>(value: VALUE, delay: number): VALUE => {
  const [debouncedValue, setDebouncedValue] = useState<VALUE>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
