import { ReactNode } from 'react';
import { ExternalToast, toast } from 'sonner';

type ToastId = string | number;

const noOp = () => {
  /** no-op */
};

/**
 * A nice wrapper around the `toast()` function from Sonner that uses the
 * builder pattern to construct a toast and update it as needed, without having
 * to keep track of a toast ID.
 *
 * @example
 * ```ts
 * const toast = new Toast().message('This is a toast').render();
 *
 * // later...
 *
 * toast
 *   .error() // Style the toast as an error
 *   .message('Uh oh -- something went wrong!') // Update the message
 *   .description('Here are the error details') // Update the description
 *   .render();
 * ```
 *
 * Note that the toast only gets rendered or updated when calling `render()`.
 * That way, you can configure your toast before anything gets rendered to the
 * user.
 *
 * @example
 * ```ts
 * // Nothing shown to the user yet:
 * const toast = new Toast().message('This is a toast');
 *
 * // Still nothing shown to the user:
 * toast.description('Here is a description.');
 *
 * // Now the user sees a toast with the above message and description:
 * toast.render();
 *
 * // After this line, the toast still hasn't changed at all, since we haven't
 * // called `.render()` yet:
 * toast.error().message('Uh oh!').description('Houston, we have a problem');
 *
 * // Finally, the toast updates to show the error message:
 * toast.render()
 * ```
 */
export class Toast {
  private toastId?: ToastId;
  private toastFn: (message: string | React.ReactNode, data?: ExternalToast) => string | number =
    toast;
  private _message?: ReactNode;
  private _description?: ReactNode;
  private _duration?: number;
  private _closeButton?: boolean;
  private _action?: {
    label: ReactNode;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  };

  render() {
    this.toastId = this.toastFn(this._message, {
      description: this._description,
      id: this.toastId,
      duration: this._duration,
      closeButton: this._closeButton,
      action: this._action,
    });

    return this;
  }

  dismiss() {
    // Only call `toast.dismiss()` if we have a toast ID, since passing
    // `undefined` to `toast.dismiss()` results in _all_ toasts being dismissed.
    if (this.toastId) toast.dismiss(this.toastId);

    return this;
  }

  message(message: ReactNode): this {
    this._message = message;
    return this;
  }

  description(description?: ReactNode): this {
    this._description = description;
    return this;
  }

  duration(duration?: number): this {
    this._duration = duration;
    return this;
  }

  closeButton(closeButton = true): this {
    this._closeButton = closeButton;
    return this;
  }

  action(label?: ReactNode, onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void): this {
    if (typeof label === 'undefined') this._action = undefined;
    else this._action = { label, onClick: onClick ?? noOp };
    return this;
  }

  default(): this {
    this.toastFn = toast;
    return this;
  }

  success(): this {
    this.toastFn = toast.success;
    return this;
  }

  info(): this {
    this.toastFn = toast.info;
    return this;
  }

  warning(): this {
    this.toastFn = toast.warning;
    return this;
  }

  error(): this {
    this.toastFn = toast.error;
    return this;
  }

  loading(): this {
    this.toastFn = toast.loading;
    return this;
  }
}
