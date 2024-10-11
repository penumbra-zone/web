import { createContext } from 'react';

/** Internal use only. */
export const DialogContext = createContext<{ showCloseButton: boolean }>({
  showCloseButton: true,
});
