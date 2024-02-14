import {
  AuthorizeAndBuildResponse,
  BroadcastTransactionResponse,
  WitnessAndBuildResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { shorten } from '@penumbra-zone/types';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

type ToastId = string | number;

export const buildingTxToast = (
  status?: (
    | AuthorizeAndBuildResponse
    | BroadcastTransactionResponse
    | WitnessAndBuildResponse
  )['status'],
  toastId?: string | number,
  message = 'Building transaction',
): ToastId => {
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

  return toast.loading(message, {
    duration: Infinity,
    description: progress !== undefined ? `${Math.round(progress * 100)}%` : undefined,
    id: toastId,
  });
};

export const broadcastingTxToast = (
  txHash: string,
  status?: BroadcastTransactionResponse['status'],
  toastId?: string | number,
): ToastId => {
  let message = 'Broadcasting transaction';
  switch (status?.case) {
    case undefined:
      message = 'Emitting transaction';
      break;
    case 'broadcastSuccess':
      message = 'Waiting for confirmation';
      break;
    case 'confirmed': // about to dismiss the toast
      break;
    default:
      console.warn('Unknown broadcast status', status);
      break;
  }

  return toast.loading(message, {
    duration: Infinity,
    description: shorten(txHash, 8),
    id: toastId,
  });
};

export const successTxToast = (
  txHash: string,
  detectionHeight?: bigint | undefined,
  toastId?: string | number,
  message = 'Confirmed transaction',
): ToastId =>
  toast.success(message, {
    duration: Infinity,
    closeButton: true,
    description: `Transaction ${shorten(txHash, 8)} appeared on chain ${detectionHeight ? `at height ${detectionHeight}` : ''}`,
    action: {
      label: <Link to={`/tx/${txHash}`}>See details</Link>,
      onClick: () => {
        /* no-op */
      },
    },
    id: toastId,
  });

export const errorTxToast = (error: unknown, toastId?: string | number): ToastId =>
  toast.error('Error with transaction', {
    duration: Infinity,
    closeButton: true,
    description: String(error),
    id: toastId,
  });
