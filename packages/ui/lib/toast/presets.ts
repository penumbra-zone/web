import { Toast } from './toast';

/**
 * This file contains toast presets for one-off use throughout the app. They
 * return instances of `Toast`, so that they can be further customized before
 * rendering to the user. Note that you'll need to call `.render()` on their
 * return value to render them.
 */

export const errorToast = (error: unknown, message = 'An error occurred') =>
  new Toast()
    .error()
    .message(message)
    .description(String(error))
    // Error toasts stay open until closed by the user, as the user may want to
    // inspect the error.
    .duration(Infinity)
    .closeButton();

export const warningToast = (title: string, subtitle: string) =>
  new Toast().warning().message(title).description(subtitle).duration(5_000);
