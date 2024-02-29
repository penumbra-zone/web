import { useRevalidator } from 'react-router-dom';
import { useEffect, useState } from 'react';

const REFETCH_INTERVAL = 5000;

export const useRefetchStatusOnInterval = () => {
  const { revalidate } = useRevalidator();

  useEffect(() => {
    const interval = setInterval(revalidate, REFETCH_INTERVAL);
    return () => clearInterval(interval); // Clear the interval when the component is unmounted
  }, [revalidate]);
};

const VISIBILITY_STATE_CHANGE_DELAY = 800;

// Meant to slow down the state transition from loading to idle so the UI can show a discernible spinner
export const useDelayedIsLoading = () => {
  const { state } = useRevalidator();

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (state === 'loading') 
      setIsVisible(true);
    

    if (state === 'idle') 
      setTimeout(() => setIsVisible(false), VISIBILITY_STATE_CHANGE_DELAY);
    
  }, [state]);

  return isVisible;
};
