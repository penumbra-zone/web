import { createContext, useContext, useState } from 'react';
import { ToastProps } from './Toast.tsx';

interface ToastContextValue {
  toasts: Map<string, ToastProps>;
  addToast: (toast: ToastProps) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, props: ToastProps) => void;
}

export const ToastContext = createContext<ToastContextValue>({} as ToastContextValue);

export const useToastContext = () => useContext(ToastContext);

export const useSetupToastContext = (): ToastContextValue => {
  const [toasts, setToasts] = useState<Map<string, ToastProps>>(new Map());

  const addToast = (toast: ToastProps): string => {
    const id = performance.now().toString() + toast.title;
    setToasts(new Map(toasts.set(id, toast)));
    return id;
  };

  const removeToast = (id: string) => {
    toasts.delete(id);
    setToasts(new Map(toasts));
  };

  const updateToast = (id: string, toast: ToastProps) => {
    toasts.set(id, toast);
    setToasts(new Map(toasts));
  };

  return {
    toasts,
    addToast,
    updateToast,
    removeToast,
  };
};

export const useToastProps = (id: string): ToastProps => {
  const { toasts } = useToastContext();
  const toast = toasts.get(id);
  if (!toast) {
    throw new Error(`No toast found with id: ${id}`);
  }
  return toast;
};

interface ToastInstance {
  id: string;
  close: () => void;
  update: (toast: ToastProps) => void;
}

export const useToast = () => {
  const { addToast, removeToast, updateToast } = useToastContext();

  return (toast: ToastProps): ToastInstance => {
    const id = addToast(toast);

    const close = () => removeToast(id);
    const update = (toast: ToastProps) => updateToast(id, toast);

    return { id, close, update };
  };
};
