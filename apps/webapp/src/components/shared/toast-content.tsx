import { shorten } from '@penumbra-zone/types';
import { Grid } from 'react-loader-spinner';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export const loadingTxToast = (
  loadingText = 'Transaction build in progress',
): Parameters<typeof toast> => [
  <div className='flex items-center justify-center gap-4' key='loading'>
    <span>{loadingText}</span>
    <Grid height='20' width='20' color='white' />
  </div>,
  {
    // Building could potentially take a long time. Expected to be dismissed manually.
    duration: Infinity,
  },
];

export const successTxToast = (
  txHash: string,
  message = 'Transaction success 🎉',
): Parameters<typeof toast> => [
  message,

  {
    description: shorten(txHash, 8),
    action: {
      label: <Link to={`/tx/${txHash}`}>See details</Link>,
      onClick: () => {
        /* no-op - Sonner requires an onClick handler, but we're using a link */
      },
    },
    closeButton: true,
    duration: Infinity,
  },
];

export const errorTxToast = (error: unknown): Parameters<typeof toast> => [
  'Error with transaction',
  { description: <p className='break-all'>{String(error)}</p> },
];
