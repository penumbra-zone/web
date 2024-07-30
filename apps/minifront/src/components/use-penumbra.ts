import { createPenumbraClient } from '@penumbra-zone/client';
import { useMemo } from 'react';

//import { PenumbraRequestFailure } from '@penumbra-zone/client';
//import { errorToast, warningToast } from '@repo/ui/lib/toast/presets';

/*
const handleErr = (e: unknown) => {
  if (e instanceof Error && e.cause) {
    switch (e.cause) {
      case PenumbraRequestFailure.Denied:
        errorToast(
          'You may need to un-ignore this site in your extension settings.',
          'Connection denied',
        ).render();
        break;
      case PenumbraRequestFailure.NeedsLogin:
        warningToast(
          'Not logged in',
          'Please login into the extension and reload the page',
        ).render();
        break;
      default:
        errorToast(e, 'Connection error').render();
    }
  } else {
    console.warn('Unknown connection failure', e);
    errorToast(e, 'Unknown connection failure').render();
  }
};
*/

export const usePenumbra = () => useMemo(() => createPenumbraClient(), []);
