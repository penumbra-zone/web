import { openToast } from '@penumbra-zone/ui/Toast';

/**
 * This file contains toast presets for one-off use throughout the app. They
 * return instances of Toast, so that they can be further customized if needed.
 */

export const errorToast = (error: unknown, message = 'An error occurred') =>
  openToast({
    type: 'error',
    message,
    description: String(error),
    // Error toasts stay open until closed by the user, as the user may want to
    // inspect the error.
    persistent: true,
    dismissible: true,
  });

export const warningToast = (title: string, subtitle: string) =>
  openToast({
    type: 'warning',
    message: title,
    description: subtitle,
    persistent: false,
  });
