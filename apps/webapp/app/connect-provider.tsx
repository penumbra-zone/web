'use client';
import { ReactNode, useEffect } from 'react';
import { useConnect } from '../hooks/connect';
import { useStore } from '../state';
import { accountSelector } from '../state/account';

const ConnectProvider = ({ children }: { children: ReactNode }) => {
  const { isConnected, isLoading } = useConnect();
  const { setConnected } = useStore(accountSelector);

  useEffect(() => {
    setConnected(isConnected);
  }, [isConnected, setConnected]);

  return <>{isLoading ? <></> : <>{children}</>}</>;
};

export default ConnectProvider;
