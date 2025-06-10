import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PenumbraClient,
  PenumbraNotInstalledError,
  PenumbraRequestFailure,
} from '@penumbra-zone/client';
import { penumbra } from '../lib/penumbra';
import { FallbackPage } from './fallback-page';

const handleErr = (e: unknown) => {
  if (e instanceof Error && e.cause) {
    switch (e.cause) {
      case PenumbraRequestFailure.Denied:
        alert('Connection denied. You may need to un-ignore this site in your extension settings.');
        break;
      case PenumbraRequestFailure.NeedsLogin:
        alert('Not logged in. Please login into the extension and reload the page.');
        break;
      default:
        alert(`Connection error: ${e.message}`);
    }
  } else {
    console.warn('Unknown connection failure', e);
    alert(`Unknown connection failure: ${String(e)}`);
  }
};

export const ExtensionNotConnected = () => {
  const [result, setResult] = useState<boolean>();
  const navigate = useNavigate();

  const connect = async (provider: string) => {
    try {
      await penumbra.connect(provider);
      navigate(0);
    } catch (e) {
      handleErr(e);
    } finally {
      setResult(true);
    }
  };

  const checkProviders = () => {
    const providers = PenumbraClient.getProviders();
    const length = Object.keys(providers).length;
    const first = Object.keys(providers)[0];

    if (length === 1 && first) {
      void connect(first);
    } else if (length > 1) {
      // For simplicity, connect to first provider
      // TODO: Add provider selection dialog
      void connect(first!);
    } else {
      throw new PenumbraNotInstalledError();
    }
  };

  const handleButtonClick = () => {
    if (!result) {
      checkProviders();
    } else {
      location.reload();
    }
  };

  return (
    <FallbackPage
      title='Welcome to Penumbra'
      description='Connect to Minifront to view your balances, transfer funds, stake UM, and more.'
      buttonText={!result ? 'Connect Wallet' : 'Reload'}
      onButtonClick={handleButtonClick}
    />
  );
};
