/**
 * Prax is the reference implementation of browser-local Penumbra services. This
 * module provides tools for connecting to Prax specifically, and a few
 * additional conveniences.
 */

import type { JsonValue, ServiceType } from '@bufbuild/protobuf';
import type { Transport } from '@connectrpc/connect';
import { createPromiseClient } from '@connectrpc/connect';
import { createChannelTransport } from '@penumbra-zone/transport-dom/src/create';
import { PenumbraSymbol } from './global';
import { jsonOptions } from '@penumbra-zone/types/src/registry';

const prax_id = 'lkpmkhpnhknhmibgnmmhdhgdilepfghe' as const;
const prax_origin = `chrome-extension://${prax_id}`;
const prax_manifest = `chrome-extension://${prax_id}/manifest.json`;

export class PraxNotAvailableError extends Error {}
export class PraxNotConnectedError extends Error {}
export class PraxNotInstalledError extends Error {}
export class PraxManifestError extends Error {}

export const getPraxPort = async () => {
  const provider = window[PenumbraSymbol]?.[prax_origin];
  if (!provider) throw new Error('Prax not installed');
  return provider.connect();
};

export const requestPraxConnection = async () => {
  if (window[PenumbraSymbol]?.[prax_origin]?.manifest !== prax_manifest) {
    throw new PraxManifestError('Incorrect Prax manifest href');
  }
  return window[PenumbraSymbol][prax_origin]?.request();
};

export const isPraxConnected = () => Boolean(window[PenumbraSymbol]?.[prax_origin]?.isConnected());

export const isPraxConnectedTimeout = (timeout: number) =>
  new Promise<boolean>(resolve => {
    if (window[PenumbraSymbol]?.[prax_origin]?.isConnected()) resolve(true);

    const interval = setInterval(() => {
      if (window[PenumbraSymbol]?.[prax_origin]?.isConnected()) {
        clearInterval(interval);
        resolve(true);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      resolve(false);
    }, timeout);
  });

export const throwIfPraxNotConnectedTimeout = async (timeout = 500) => {
  const isConnected = await isPraxConnectedTimeout(timeout);
  if (!isConnected) throw new PraxNotConnectedError('Prax not connected');
};

export const isPraxAvailable = () => Boolean(window[PenumbraSymbol]?.[prax_origin]);

export const throwIfPraxNotAvailable = () => {
  if (!isPraxAvailable()) throw new PraxNotAvailableError('Prax not available');
};

export const throwIfPraxNotConnected = () => {
  if (!isPraxConnected()) throw new PraxNotConnectedError('Prax not connected');
};

export const getPraxManifest = async () => {
  const response = await fetch(prax_manifest);
  return (await response.json()) as JsonValue;
};

export const isPraxInstalled = () =>
  getPraxManifest().then(
    () => true,
    () => false,
  );

export const throwIfPraxNotInstalled = async () => {
  const isInstalled = await isPraxInstalled();
  if (!isInstalled) throw new PraxNotInstalledError('Prax not installed');
};

let praxTransport: Transport | undefined;
export const createPraxClient = <T extends ServiceType>(serviceType: T) => {
  praxTransport ??= createChannelTransport({
    defaultTimeoutMs: 10000,
    getPort: getPraxPort,
    jsonOptions,
  });
  return createPromiseClient(serviceType, praxTransport);
};
