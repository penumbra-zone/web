import { shorten } from '@penumbra-zone/types';
import { ToastAction } from '@penumbra-zone/ui/components/ui/toast';
import { ToastFnProps } from '@penumbra-zone/ui/components/ui/use-toast';
import { Grid } from 'react-loader-spinner';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export const loadingTxToast: ToastFnProps = {
  main: (
    <div className='flex items-center justify-center gap-4'>
      <span>Transaction build in progress</span>
      <Grid height='20' width='20' color='white' />
    </div>
  ),
  duration: Infinity, // Building could potentially take a long time. Expected to be dismissed manually.
};

export const successTxToast = (txHash: string): ToastFnProps => ({
  main: 'Transaction success 🎉',
  variant: 'success',
  subText: shorten(txHash, 8),
  action: (
    <Link to={`/tx/${txHash}`}>
      <ToastAction className='border-transparent bg-teal-800' altText='See transaction details'>
        See details
      </ToastAction>
    </Link>
  ),
});

export const errorTxToast = (error: unknown): ToastFnProps => ({
  variant: 'error',
  main: 'Error with transaction',
  subText: <p className='break-all'>{String(error)}</p>,
});

export const loadingTxSonnerToast = (
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

export const successSonnerTxToast = (
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

export const errorSonnerTxToast = (error: unknown): Parameters<typeof toast> => [
  'Error with transaction',
  { description: <p className='break-all'>{String(error)}</p> },
];
