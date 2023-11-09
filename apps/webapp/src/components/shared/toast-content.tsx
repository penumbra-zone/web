import { shorten } from '@penumbra-zone/types';
import { ToastAction } from '@penumbra-zone/ui/components/ui/toast';
import { ToastFnProps } from '@penumbra-zone/ui/components/ui/use-toast';
import { Grid } from 'react-loader-spinner';
import { Link } from 'react-router-dom';

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
  subText: String(error),
});
