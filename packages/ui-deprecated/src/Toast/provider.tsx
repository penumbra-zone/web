import { Toaster, ToasterProps } from 'sonner';

/**
 * If `<ToastProvider />` exists in the document, you can call `openToast` function to open a toast with provided type and options.
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
export const ToastProvider = ({ ...props }: ToasterProps) => {
  return <Toaster theme='dark' richColors expand {...props} />;
};
