import { toast, ExternalToast } from 'sonner';
import { ReactNode } from 'react';

export type ToastType = 'success' | 'info' | 'warning' | 'error' | 'loading';
type ToastFn = (message: ReactNode, options?: ExternalToast) => string | number;
type ToastId = string | number;

const toastFnMap: Record<ToastType, ToastFn> = {
  success: toast.success,
  info: toast.info,
  warning: toast.warning,
  error: toast.error,
  loading: toast.loading,
};

export interface ToastProps {
  type: ToastType;
  message: string;
  description?: ReactNode;
  persistent?: boolean;
  dismissible?: boolean;
  action?: ExternalToast['action'];
}

export interface Toast {
  update: (newProps: Partial<ToastProps>) => void;
  dismiss: VoidFunction;
}

function truncateString(str: string, maxLength: number): string {
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
}

/**
 * If `<ToastProvider />` exists in the document, opens a toast with provided type and options.
 * By default, the toast is dismissible and has a duration of 4000 milliseconds. It can
 * be programmatically updated to another type and content without re-opening the toast.
 *
 * Example:
 *
 * ```tsx
 * import { ToastProvider, openToast } from '@penumbra-zone/ui/Toast';
 * import { ToastProvider, openToast } from '@penumbra-zone/ui/Button';
 *
 * const Component = () => {
 *   const open = () => {
 *     const toast = openToast({
 *       type: 'loading',
 *       message: 'Loading...',
 *     });
 *
 *     setTimeout(() => {
 *       toast.update({
 *         type: 'error',
 *         message: 'Failed!',
 *         description: 'Unknown error'
 *       });
 *     }, 2000);
 *   };
 *
 *   return (
 *     <>
 *       <ToastProvider />
 *       <Button onClick={open}>Open</Button>
 *     </>
 *   );
 * };
 * ```
 */
export const openToast = (props: ToastProps): Toast => {
  let options = props;
  let id: ToastId | undefined = undefined;

  const open = () => {
    const fn = toastFnMap[options.type];

    id = fn(options.message, {
      id,
      description:
        typeof options.description === 'string'
          ? truncateString(options.description, 200)
          : options.description,
      closeButton: options.dismissible ?? true,
      dismissible: options.dismissible ?? true,
      duration: options.persistent ? Infinity : 4000,
      action: options.action,
    });
  };

  const dismiss: Toast['dismiss'] = () => {
    if (typeof id === 'undefined') {
      return;
    }

    toast.dismiss(id);
    id = undefined;
  };

  const update: Toast['update'] = newProps => {
    if (typeof id === 'undefined') {
      return;
    }

    options = { ...options, ...newProps };
    open();
  };

  open();

  return {
    dismiss,
    update,
  };
};
