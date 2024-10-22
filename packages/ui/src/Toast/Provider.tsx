import {
  ToastProvider as RadixToastProvider,
  ToastViewport as RadixToastViewport,
} from '@radix-ui/react-toast';
import { ToastContext, useSetupToastContext } from './Context.ts';
import { Toast } from './Toast.tsx';
import { ReactNode } from 'react';

export interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const contextValue = useSetupToastContext();
  console.log(contextValue.toasts);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      <RadixToastProvider>
        {[...contextValue.toasts.keys()].map(id => (
          <Toast key={id} id={id} />
        ))}
        <RadixToastViewport />
      </RadixToastProvider>
    </ToastContext.Provider>
  );
};
