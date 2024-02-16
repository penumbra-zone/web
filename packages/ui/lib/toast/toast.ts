import { ReactNode } from 'react';
import { ExternalToast, toast } from 'sonner';

type ToastId = string | number;

const noOp = () => {
  /** no-op */
};

/**
 * `Toast` is a wrapper around the `toast()` function from Sonner that uses the
 * builder pattern to manage the lifecycle of a toast. It allows consumers to
 * construct a toast and update it as needed without having to keep track of a
 * toast ID.
 *
 * Generally speaking, this class will probably not be used directly by UIs;
 * rather, it will be used by other classes that manage the lifecycle of a toast
 * for specific use cases.
 *
 * @example
 * ```ts
 * const toast = new Toast().loading().message('Loading data...').render();
 *
 * // later...
 *
 * toast
 *   .error() // Style the toast as an error
 *   .message('Uh oh -- something went wrong!') // Update the message
 *   .description('Here are the error details') // Update the description
 *   .render(); // Apply the changes to the existing toast
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
 * // called `.render()` again yet:
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

  /**
   * When called for the first time, opens the toast. When called subsequent
   * times, updates the toast with any changes made to it via other methods.
   *
   * Note that nothing will be shown to the user until `.render()` is called for
   * the first time, and no subsequent updates will be applied to the toast
   * until `.render()` is called a subsequent time.
   */
  render(): this {
    this.toastId = this.toastFn(this._message, {
      description: this._description,
      id: this.toastId,
      duration: this._duration,
      closeButton: this._closeButton,
      action: this._action,
    });

    return this;
  }

  /**
   * Dismisses the toast. Dismissing a toast doesn't actually destroy it in any
   * meaningful sense, so you can always re-open the toast by calling
   * `.render()`.
   */
  dismiss(): this {
    // Only call `toast.dismiss()` if we have a toast ID, since passing
    // `undefined` to `toast.dismiss()` results in _all_ toasts being dismissed.
    if (this.toastId) {
      toast.dismiss(this.toastId);
      this.toastId = undefined;
    }

    return this;
  }

  /**
   * Sets the toast message.
   */
  message(message: ReactNode): this {
    this._message = message;
    return this;
  }

  /**
   * Sets the toast description.
   */
  description(description?: ReactNode): this {
    this._description = description;
    return this;
  }

  /**
   * Sets the toast duration.
   */
  duration(duration?: number): this {
    this._duration = duration;
    return this;
  }

  /**
   * Controls whether to show a close button. By default, toasts do not include
   * a close button. Calling `.closeButton()` or `.closeButton(true)` will
   * result in a close button being shown on the next call to `.render()`;
   * calling `.closeButton(false)` will result in the close button being hidden.
   */
  closeButton(closeButton = true): this {
    this._closeButton = closeButton;
    return this;
  }

  /**
   * Sets or removes an action from the toast. Calling with `undefined` will
   * remove the action; anything else will add an action. You can leave the
   * `onClick` handler undefined if your label already includes click
   * functionality (e.g., if it's a `<Link />`); but note that the label will
   * always be rendered inside a button.
   */
  action(label?: ReactNode, onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void): this {
    if (typeof label === 'undefined') this._action = undefined;
    else this._action = { label, onClick: onClick ?? noOp };
    return this;
  }

  /**
   * Sets the toast to use the default rendering style.
   */
  default(): this {
    this.toastFn = toast;
    return this;
  }

  /**
   * Sets the toast to use the success rendering style.
   */
  success(): this {
    this.toastFn = toast.success;
    return this;
  }

  /**
   * Sets the toast to use the info rendering style.
   */
  info(): this {
    this.toastFn = toast.info;
    return this;
  }

  /**
   * Sets the toast to use the warning rendering style.
   */
  warning(): this {
    this.toastFn = toast.warning;
    return this;
  }

  /**
   * Sets the toast to use the error rendering style.
   */
  error(): this {
    this.toastFn = toast.error;
    return this;
  }

  /**
   * Sets the toast to use the loading rendering style.
   */
  loading(): this {
    this.toastFn = toast.loading;
    return this;
  }
}
