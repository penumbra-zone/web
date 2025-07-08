import { createContext, useContext } from 'react';
import type { ClientEnv } from './env/types';

const ClientEnvContext = createContext<ClientEnv | undefined>(undefined);

export const ClientEnvProvider = ({
  value,
  children,
}: React.PropsWithChildren<{ value: ClientEnv }>) => {
  return <ClientEnvContext.Provider value={value}>{children}</ClientEnvContext.Provider>;
};

const useClientEnvWithGlobals = () => {
  const value = useContext(ClientEnvContext);
  if (!value) {
    throw new Error(
      'No ClientEnvProvider in ambient scope, make sure to wrap this component in one',
    );
  }
  return value;
};

export const useClientEnv = () => {
  const data = useClientEnvWithGlobals();
  return data;
};
