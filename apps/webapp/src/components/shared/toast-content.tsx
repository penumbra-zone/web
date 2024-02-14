import {
  AuthorizeAndBuildResponse,
  BroadcastTransactionResponse,
  WitnessAndBuildResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { shorten } from '@penumbra-zone/types';
import { ToastAction } from '@penumbra-zone/ui/components/ui/toast';
import { ToastFnProps } from '@penumbra-zone/ui/components/ui/use-toast';
import { Bars, Grid, Watch } from 'react-loader-spinner';
import { Link } from 'react-router-dom';

export const buildingTxToast = (
  status?: (AuthorizeAndBuildResponse | WitnessAndBuildResponse)['status'],
): ToastFnProps => {
  let progress: undefined | number;

  switch (status?.case) {
    case undefined:
      progress = 0;
      break;
    case 'buildProgress':
      progress = status.value.progress;
      break;
    case 'complete':
      progress = 1;
      break;
    default:
      console.warn('Unknown build status', status);
      break;
  }

  return {
    duration: Infinity,
    title: 'Building Transaction',
    main: (
      <div className='flex items-center justify-center gap-4'>
        <span>
          Transaction building... {progress != null ? `${Math.round(progress * 100)}%` : null}
        </span>
        <Grid height='20' width='20' color='white' />
      </div>
    ),
  };
};

export const broadcastingTxToast = (
  txHash: string,
  status?: BroadcastTransactionResponse['status'],
): ToastFnProps => {
  let main: JSX.Element | undefined = undefined;
  let variant: 'default' | 'success' | undefined = undefined;
  switch (status?.case) {
    case undefined:
      variant = 'default';
      main = (
        <div className='flex items-center justify-center gap-4'>
          <span>Emitting transaction...</span>
          <Bars height='20' width='20' color='white' />
        </div>
      );
      break;
    case 'broadcastSuccess':
      variant = 'default';
      main = (
        <div className='flex items-center justify-center gap-4'>
          <span>Waiting for confirmation...</span>
          <Watch height='20' width='20' color='white' />
        </div>
      );
      break;
    case 'confirmed': // about to dismiss the toast
      variant = 'success';
      break;
    default:
      console.warn('Unknown broadcast status', status);
      break;
  }

  return {
    duration: Infinity,
    title: 'Broadcasting Transaction',
    variant,
    subText: shorten(txHash, 8),
    main,
  };
};

export const successTxToast = (
  txHash: string,
  detectionHeight?: bigint | undefined,
): ToastFnProps => ({
  duration: Infinity,
  title: 'Confirmed Transaction',
  variant: 'success',
  subText: shorten(txHash, 8),
  main: (
    <div className='flex items-center justify-center gap-4'>
      <span>
        Transaction appeared on chain
        {detectionHeight ? <>at height ${detectionHeight}</> : null}
      </span>
    </div>
  ),
  action: (
    <Link to={`/tx/${txHash}`}>
      <ToastAction className='border-transparent bg-teal-800' altText='See transaction details'>
        See details
      </ToastAction>
    </Link>
  ),
});

export const errorTxToast = (error: unknown): ToastFnProps => ({
  duration: Infinity,
  variant: 'error',
  main: 'Error with transaction',
  subText: <p className='break-all'>{String(error)}</p>,
});
